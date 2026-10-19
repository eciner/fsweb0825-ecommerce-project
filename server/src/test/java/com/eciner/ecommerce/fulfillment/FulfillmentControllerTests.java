package com.eciner.ecommerce.fulfillment;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.eciner.ecommerce.user.*;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.store.*;
import com.eciner.ecommerce.common.error.ConflictException;
import com.fasterxml.jackson.databind.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FulfillmentControllerTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired UserRepository users;
    @Autowired StoreRepository stores;
    @Autowired RoleRepository roles;
    @Autowired PasswordEncoder encoder;
    @Autowired ShipmentService service;
    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean ShipmentRepository shipmentRepository;
    record Account(long id,Long storeId,String token) {}
    Account customer,other,storeA,storeB,admin;
    Map<Long,int[]> inventory=new HashMap<>();
    @BeforeEach void setup() throws Exception {
        customer=account("customer");other=account("customer");storeA=account("store");storeB=account("store");admin=account("admin");
        for(long id:List.of(1L,4L)) {
            inventory.put(id,new int[]{jdbc.queryForObject("select stock from product where id=?",Integer.class,id),jdbc.queryForObject("select sell_count from product where id=?",Integer.class,id)});
        }
        assign(1,storeA.storeId());assign(4,storeB.storeId());
    }
    @AfterEach void restore() {
        inventory.forEach((id,values)->jdbc.update("update product set stock=?,sell_count=?,fulfillment_store_id=null where id=?",values[0],values[1],id));
    }
    Account account(String role) throws Exception {
        String suffix=UUID.randomUUID().toString();String password="Synthetic-"+suffix+"Aa1!";
        Store store=role.equals("store")?stores.saveAndFlush(new Store("Synthetic Store","05550000000",suffix.substring(0,16),"TR"+suffix.replace("-",""))):null;
        var user=users.saveAndFlush(new User("Synthetic "+role,suffix+"@example.test",encoder.encode(password),roles.findByCode(role).orElseThrow(),store));
        var response=json(mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("email",user.getEmail(),"password",password)))));
        return new Account(user.getId(),store==null?null:store.getId(),response.path("token").asText());
    }
    JsonNode json(ResultActions action) throws Exception { return mapper.readTree(action.andReturn().getResponse().getContentAsString()); }
    void assign(long product,Long store) throws Exception {
        var body=new HashMap<String,Object>();body.put("store_id",store);
        mvc.perform(put("/fulfillment/products/"+product+"/store").header("Authorization",admin.token()).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body))).andExpect(status().isOk());
    }
    long order() throws Exception {
        long address=json(mvc.perform(post("/user/address").header("Authorization",customer.token()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Synthetic shipping\",\"name\":\"Test\",\"surname\":\"Buyer\",\"phone\":\"+905551112233\",\"city\":\"Ankara\",\"district\":\"Manual\",\"neighborhood\":\"Synthetic street\"}"))).path("id").asLong();
        return json(mvc.perform(post("/order").header("Authorization",customer.token()).contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(Map.of("address_id",address,"price",1,"request_id",UUID.randomUUID(),"products",List.of(Map.of("product_id",1,"count",1),Map.of("product_id",4,"count",1)))))).andExpect(status().isCreated())).path("id").asLong();
    }
    JsonNode owned(Account account,long order) throws Exception { return json(mvc.perform(get("/order/"+order+"/shipments").header("Authorization",account.token())).andExpect(status().isOk())); }
    long shipment(long order,long store) { return jdbc.queryForObject("select id from shipment where order_id=? and store_id=?",Long.class,order,store); }
    Map<String,Object> update(String state,long version,String carrier,String tracking,UUID request) {
        var body=new HashMap<String,Object>();body.put("status",state);body.put("version",version);body.put("carrier",carrier);body.put("tracking_number",tracking);body.put("request_id",request);return body;
    }
    ResultActions change(Account actor,long id,Map<String,Object> body) throws Exception { return mvc.perform(put("/fulfillment/shipments/"+id).header("Authorization",actor.token()).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body))); }

    @Test void customerCanOnlyReadOwnedShipmentsAndCannotManage() throws Exception {
        long order=order();var result=owned(customer,order);
        assertThat(result.path("shipments")).hasSize(2);assertThat(result.path("status").asText()).isEqualTo("ORDER_PLACED");
        mvc.perform(get("/order/"+order+"/shipments").header("Authorization",other.token())).andExpect(status().isNotFound());
        mvc.perform(get("/fulfillment/shipments").header("Authorization",customer.token())).andExpect(status().isForbidden());
        change(customer,shipment(order,storeA.storeId()),update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isForbidden());
        mvc.perform(get("/fulfillment/shipments")).andExpect(status().isUnauthorized());
    }
    @Test void customerHistoryOmitsActorIdsWhileScopedManagementRetainsAudit() throws Exception {
        long order=order(),a=shipment(order,storeA.storeId()),b=shipment(order,storeB.storeId());
        UUID storeRequest=UUID.randomUUID(),adminRequest=UUID.randomUUID();
        change(storeA,a,update("PREPARING",0,null,null,storeRequest)).andExpect(status().isOk());
        change(admin,b,update("PREPARING",0,null,null,adminRequest)).andExpect(status().isOk());
        var customerView=owned(customer,order);
        assertThat(customerView.path("status").asText()).isEqualTo("PREPARING");
        for(var shipment:customerView.path("shipments")) {
            assertThat(shipment.path("history")).hasSize(2);
            for(var event:shipment.path("history")) {
                assertThat(event.has("actor_id")).isFalse();
                assertThat(event.path("recorded_at").asText()).isNotBlank();
                assertThat(event.path("status").asText()).isIn("ORDER_PLACED","PREPARING");
            }
        }
        for(var manager:List.of(storeA,admin)) {
            var managed=json(mvc.perform(get("/fulfillment/shipments").header("Authorization",manager.token())).andExpect(status().isOk()));
            var own=java.util.stream.StreamSupport.stream(managed.path("shipments").spliterator(),false)
                .filter(row->row.path("id").asLong()==a).findFirst().orElseThrow();
            assertThat(own.path("history").get(1).path("actor_id").asLong()).isEqualTo(storeA.id());
            if(manager==admin) {
                var second=java.util.stream.StreamSupport.stream(managed.path("shipments").spliterator(),false)
                    .filter(row->row.path("id").asLong()==b).findFirst().orElseThrow();
                assertThat(second.path("history").get(1).path("actor_id").asLong()).isEqualTo(admin.id());
            }
        }
        assertThat(jdbc.queryForObject("select actor_id from shipment_event where request_id=?",Long.class,storeRequest)).isEqualTo(storeA.id());
        mvc.perform(get("/order/"+order+"/shipments").header("Authorization",other.token())).andExpect(status().isNotFound());
        change(storeB,a,update("SHIPPED",1,"Carrier","TEST",UUID.randomUUID())).andExpect(status().isNotFound());
    }
    @Test void storeOnlySeesItsOwnLinesAndCannotUpdateOtherStoreOrAssignments() throws Exception {
        long order=order();long a=shipment(order,storeA.storeId()),b=shipment(order,storeB.storeId());
        var listed=json(mvc.perform(get("/fulfillment/shipments").header("Authorization",storeA.token())).andExpect(status().isOk()));
        for(var row:listed.path("shipments")) { assertThat(row.path("store_id").asLong()).isEqualTo(storeA.storeId());assertThat(row.path("items").get(0).path("product_id").asLong()).isEqualTo(1); }
        change(storeA,b,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isNotFound());
        change(storeA,a,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
        mvc.perform(get("/fulfillment/stores").header("Authorization",storeA.token())).andExpect(status().isForbidden());
        mvc.perform(put("/fulfillment/products/1/store").header("Authorization",storeA.token()).contentType(MediaType.APPLICATION_JSON).content("{\"store_id\":1}")).andExpect(status().isForbidden());
    }
    @Test void multiStoreLifecycleUsesActualIndependentStatesAndAdminCanManageBoth() throws Exception {
        long order=order(),a=shipment(order,storeA.storeId()),b=shipment(order,storeB.storeId());
        change(storeA,a,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
        assertThat(owned(customer,order).path("status").asText()).isEqualTo("PARTIALLY_PREPARING");
        change(admin,b,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
        assertThat(owned(customer,order).path("status").asText()).isEqualTo("PREPARING");
        change(storeA,a,update("SHIPPED",1,"Synthetic carrier","TEST-A",UUID.randomUUID())).andExpect(status().isOk());
        assertThat(owned(customer,order).path("status").asText()).isEqualTo("PARTIALLY_SHIPPED");
        change(admin,a,update("DELIVERED",2,"Synthetic carrier","TEST-A",UUID.randomUUID())).andExpect(status().isOk());
        assertThat(owned(customer,order).path("status").asText()).isEqualTo("PARTIALLY_DELIVERED");
        change(admin,b,update("SHIPPED",1,"Synthetic carrier","TEST-B",UUID.randomUUID())).andExpect(status().isOk());
        change(storeB,b,update("DELIVERED",2,"Synthetic carrier","TEST-B",UUID.randomUUID())).andExpect(status().isOk());
        assertThat(owned(customer,order).path("status").asText()).isEqualTo("DELIVERED");
        assertThat(jdbc.queryForObject("select count(*) from shipment_event where shipment_id in (?,?)",Long.class,a,b)).isEqualTo(8);
    }
    @Test void rejectsSkipsReversalsMissingTrackingAndStaleUpdatesWithoutExtraEvents() throws Exception {
        long a=shipment(order(),storeA.storeId());
        change(admin,a,update("SHIPPED",0,"Carrier","X",UUID.randomUUID())).andExpect(status().isConflict());
        change(admin,a,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
        change(admin,a,update("SHIPPED",1,null,null,UUID.randomUUID())).andExpect(status().isBadRequest());
        change(admin,a,update("ORDER_PLACED",1,null,null,UUID.randomUUID())).andExpect(status().isConflict());
        change(admin,a,update("SHIPPED",0,"Carrier","X",UUID.randomUUID())).andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("select count(*) from shipment_event where shipment_id=?",Long.class,a)).isEqualTo(2);
    }
    @Test void replayIsIdempotentAndChangedRequestConflicts() throws Exception {
        long a=shipment(order(),storeA.storeId());UUID key=UUID.randomUUID();
        var body=update("PREPARING",0,null,null,key);
        change(storeA,a,body).andExpect(status().isOk());change(storeA,a,body).andExpect(status().isOk());
        change(storeA,a,update("SHIPPED",1,"Carrier","X",key)).andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("select version from shipment where id=?",Long.class,a)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select actor_id from shipment_event where shipment_id=? and request_id=?",Long.class,a,key)).isEqualTo(storeA.id());
    }
    @Test void assignmentNeverRetroactivelyTransfersPurchasedLines() throws Exception {
        long a=shipment(order(),storeA.storeId());assign(1,storeB.storeId());
        change(storeA,a,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
        change(storeB,a,update("SHIPPED",1,"Carrier","X",UUID.randomUUID())).andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("select count(*) from product_fulfillment_audit where product_id=1 and actor_id=?",Long.class,admin.id())).isEqualTo(2);
    }
    @Test void unverifiedProductsRemainAdminManagedDespiteLegacyStoreIdCollision() throws Exception {
        assign(1,null);assign(4,null);long order=order();var rows=owned(customer,order).path("shipments");
        assertThat(rows).hasSize(1);assertThat(rows.get(0).path("store_id").isNull()).isTrue();long id=rows.get(0).path("id").asLong();
        change(storeA,id,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isNotFound());
        change(admin,id,update("PREPARING",0,null,null,UUID.randomUUID())).andExpect(status().isOk());
    }
    @Test void concurrentDifferentUpdatesHaveOneWinner() throws Exception { concurrent(false); }
    @Test void updateCannotMassAssignOrderStoreOrActorAndValidatesTypedFields() throws Exception {
        long order=order(),a=shipment(order,storeA.storeId());
        var body=update("PREPARING",0,null,null,UUID.randomUUID());body.put("store_id",storeB.storeId());body.put("order_id",999999);body.put("actor_id",admin.id());
        change(storeA,a,body).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("select store_id from shipment where id=?",Long.class,a)).isEqualTo(storeA.storeId());
        assertThat(jdbc.queryForObject("select order_id from shipment where id=?",Long.class,a)).isEqualTo(order);
        body.put("status","UNSUPPORTED");change(admin,a,body).andExpect(status().isBadRequest());
        body.put("status","SHIPPED");body.put("carrier","x".repeat(101));change(admin,a,body).andExpect(status().isBadRequest());
    }
    @Test void concurrentDuplicateRequestOnlyRecordsOneEvent() throws Exception { concurrent(true); }
    @Test void shipmentReadKeepsStatusAndHistoryInOneSnapshotDuringConcurrentUpdate() throws Exception {
        long order=order(),id=shipment(order,storeA.storeId());
        var reached=new CountDownLatch(1);var release=new CountDownLatch(1);
        var readerThread=new java.util.concurrent.atomic.AtomicLong();var pool=Executors.newSingleThreadExecutor();
        org.mockito.Mockito.doAnswer(invocation->{
            if(Thread.currentThread().threadId()==readerThread.get()) { reached.countDown(); if(!release.await(20,TimeUnit.SECONDS)) throw new IllegalStateException("Snapshot test timeout"); }
            return invocation.callRealMethod();
        }).when(shipmentRepository).views(org.mockito.ArgumentMatchers.anyList());
        try {
            var reader=pool.submit(()->{readerThread.set(Thread.currentThread().threadId());return service.owned(customer.id(),order);});
            assertThat(reached.await(20,TimeUnit.SECONDS)).isTrue();
            service.update(storeA.id(),id,new ShipmentUpdate(UUID.randomUUID(),0L,ShipmentStatus.PREPARING,null,null));
            release.countDown();var before=reader.get(20,TimeUnit.SECONDS);
            assertThat(before.status()).isEqualTo("ORDER_PLACED");
            assertThat(before.shipments().stream().filter(row->row.id()==id).findFirst().orElseThrow().history()).hasSize(1);
            var after=service.owned(customer.id(),order);
            assertThat(after.status()).isEqualTo("PARTIALLY_PREPARING");
            assertThat(after.shipments().stream().filter(row->row.id()==id).findFirst().orElseThrow().history()).hasSize(2);
        } finally { release.countDown();pool.shutdownNow();org.mockito.Mockito.reset(shipmentRepository); }
    }
    void concurrent(boolean identical) throws Exception {
        long a=shipment(order(),storeA.storeId());UUID key=UUID.randomUUID();var pool=Executors.newFixedThreadPool(2);var gate=new CountDownLatch(1);
        try {
            List<Future<Boolean>> attempts=new ArrayList<>();
            for(int i=0;i<2;i++){UUID request=identical?key:UUID.randomUUID();attempts.add(pool.submit(()->{gate.await();try{service.update(storeA.id(),a,new ShipmentUpdate(request,0L,ShipmentStatus.PREPARING,null,null));return true;}catch(ConflictException ex){return false;}}));}
            gate.countDown();int successes=0;for(var attempt:attempts)if(attempt.get(20,TimeUnit.SECONDS))successes++;
            assertThat(successes).isEqualTo(identical?2:1);
            assertThat(jdbc.queryForObject("select version from shipment where id=?",Long.class,a)).isEqualTo(1);
            assertThat(jdbc.queryForObject("select count(*) from shipment_event where shipment_id=?",Long.class,a)).isEqualTo(2);
        } finally {pool.shutdownNow();}
    }
}
