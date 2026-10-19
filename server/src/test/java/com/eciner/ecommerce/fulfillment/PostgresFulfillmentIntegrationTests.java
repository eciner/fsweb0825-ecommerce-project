package com.eciner.ecommerce.fulfillment;

import static org.assertj.core.api.Assertions.assertThat;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
class PostgresFulfillmentIntegrationTests extends FulfillmentControllerTests {
    @Container static final PostgreSQLContainer<?> postgres=new PostgreSQLContainer<>("postgres:16-alpine");
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",postgres::getJdbcUrl);
        registry.add("spring.datasource.username",postgres::getUsername);
        registry.add("spring.datasource.password",postgres::getPassword);
        registry.add("spring.datasource.driver-class-name",()->"org.postgresql.Driver");
    }
    @Test void v12UpgradePreservesHistoryAndDoesNotInferStoreOwnership() throws Exception {
        String schema="fulfillment_upgrade";
        Flyway.configure().dataSource(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword())
            .schemas(schema).locations("classpath:db/migration").target("12").load().migrate();
        try(var connection=java.sql.DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword())) {
            connection.setSchema(schema);
            try(var sql=connection.createStatement()) {
                sql.executeUpdate("insert into store(id,name,phone,tax_no,bank_account) values(1,'Synthetic legacy collision','05550000000','UPGRADE','TEST')");
                sql.executeUpdate("insert into app_user(id,name,email,password_hash,role_id,store_id) select 1,'Synthetic Store','upgrade-store@example.test','no-login-fixture',id,1 from role where code='store'");
                sql.executeUpdate("insert into customer_order(id,user_id,address_id,order_date,price) values(1,1,42,CURRENT_TIMESTAMP,299.90)");
                sql.executeUpdate("insert into order_item(order_id,product_id,count,unit_price,detail) values(1,1,1,299.90,'preserved historical detail')");
                sql.executeUpdate("update customer_order set shipping_address='Synthetic shipping snapshot',receipt_address='Synthetic receipt snapshot',currency='USD' where id=1");
                sql.executeUpdate("insert into user_favorite(user_id,product_id) values(1,1)");
                sql.executeUpdate("insert into contact_message(submission_id,sender_name,email,subject,message,created_at) values('00000000-0000-0000-0000-000000000013','Synthetic sender','migration@example.test','Synthetic subject','Preserved synthetic message',CURRENT_TIMESTAMP)");
            }
        }
        Flyway.configure().dataSource(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword())
            .schemas(schema).locations("classpath:db/migration").load().migrate();
        try(var connection=java.sql.DriverManager.getConnection(postgres.getJdbcUrl(),postgres.getUsername(),postgres.getPassword())) {
            connection.setSchema(schema);
            try(var sql=connection.createStatement();var row=sql.executeQuery("select s.store_id,s.historical,e.actor_id,e.kind,i.fulfillment_store_id,i.detail,o.price,p.fulfillment_store_id from shipment s join shipment_event e on e.shipment_id=s.id join shipment_item si on si.shipment_id=s.id join order_item i on i.id=si.order_item_id join customer_order o on o.id=s.order_id join product p on p.id=i.product_id")) {
                assertThat(row.next()).isTrue();assertThat(row.getObject(1)).isNull();assertThat(row.getBoolean(2)).isTrue();
                assertThat(row.getObject(3)).isNull();assertThat(row.getString(4)).isEqualTo("HISTORICAL_IMPORT");
                assertThat(row.getObject(5)).isNull();assertThat(row.getString(6)).isEqualTo("preserved historical detail");
                assertThat(row.getBigDecimal(7)).isEqualByComparingTo("299.90");assertThat(row.getObject(8)).isNull();assertThat(row.next()).isFalse();
            }
            try(var sql=connection.createStatement();var row=sql.executeQuery("select shipping_address,receipt_address,currency from customer_order where id=1")) {
                assertThat(row.next()).isTrue();assertThat(row.getString(1)).isEqualTo("Synthetic shipping snapshot");
                assertThat(row.getString(2)).isEqualTo("Synthetic receipt snapshot");assertThat(row.getString(3)).isEqualTo("USD");
            }
            try(var sql=connection.createStatement();var row=sql.executeQuery("select count(*) from user_favorite where user_id=1 and product_id=1")) {
                assertThat(row.next()).isTrue();assertThat(row.getInt(1)).isEqualTo(1);
            }
            try(var sql=connection.createStatement();var row=sql.executeQuery("select message from contact_message where submission_id='00000000-0000-0000-0000-000000000013'")) {
                assertThat(row.next()).isTrue();assertThat(row.getString(1)).isEqualTo("Preserved synthetic message");
            }
        }
    }
    @Test
    @org.springframework.transaction.annotation.Transactional
    void postgresCatalogUsesTurkishFoldingAndWholeDatasetFilters() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/products").param("filter","SİYAH").param("limit","1"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.total").value(2))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.products.length()").value(1));
        jdbc.update("update product set name=?,description='' where id=1", "\u0130zmir \u0131\u015f\u0131k \u015eal G\u00f6mlek \u00c7anta \u00dcr\u00fcn");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/products").param("filter","izmir isik sal gomlek canta urun"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.total").value(1))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.products[0].id").value(1));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/products").param("filter","?"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.total").value(0));
    }
}
