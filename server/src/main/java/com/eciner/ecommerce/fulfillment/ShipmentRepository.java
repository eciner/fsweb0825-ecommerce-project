package com.eciner.ecommerce.fulfillment;

import java.sql.*;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ShipmentRepository {
    private final JdbcTemplate jdbc;
    public ShipmentRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    public record Row(long id, long orderId, Long storeId, ShipmentStatus status, long version,
            String carrier, String tracking, Instant created, Instant updated, boolean historical) {}
    private Row row(ResultSet rs, int index) throws SQLException {
        return new Row(rs.getLong("id"),rs.getLong("order_id"),(Long)rs.getObject("store_id"),
            ShipmentStatus.valueOf(rs.getString("status")),rs.getLong("version"),rs.getString("carrier"),rs.getString("tracking_number"),
            rs.getTimestamp("created_at").toInstant(),rs.getTimestamp("updated_at").toInstant(),rs.getBoolean("historical"));
    }
    public List<Row> forOrder(long orderId) { return jdbc.query("select * from shipment where order_id=? order by id",this::row,orderId); }
    public Optional<Row> lock(long id, Long storeId) {
        return jdbc.query("select * from shipment where id=?"+(storeId==null?"":" and store_id=?")+" for update",
            this::row,storeId==null?new Object[]{id}:new Object[]{id,storeId}).stream().findFirst();
    }
    public long insert(long orderId, Long storeId, Instant now) {
        var key=new GeneratedKeyHolder();
        jdbc.update(connection -> {
            var ps=connection.prepareStatement("insert into shipment(order_id,store_id,status,created_at,updated_at) values(?,?,'ORDER_PLACED',?,?)", new String[]{"id"});
            ps.setLong(1,orderId); ps.setObject(2,storeId); ps.setTimestamp(3,Timestamp.from(now));ps.setTimestamp(4,Timestamp.from(now));return ps;
        },key);
        return Objects.requireNonNull(key.getKey()).longValue();
    }
    public void attach(long shipmentId, long itemId) { jdbc.update("insert into shipment_item(shipment_id,order_item_id) values(?,?)",shipmentId,itemId); }
    public void event(long shipmentId, UUID requestId, String status, String carrier, String tracking, long actorId, Instant now, String kind) {
        jdbc.update("insert into shipment_event(shipment_id,request_id,status,carrier,tracking_number,actor_id,recorded_at,kind) values(?,?,?,?,?,?,?,?)",
            shipmentId,requestId,status,carrier,tracking,actorId,Timestamp.from(now),kind);
    }
    public Optional<Map<String,Object>> request(long id, UUID requestId) {
        return jdbc.queryForList("select status,carrier,tracking_number,actor_id from shipment_event where shipment_id=? and request_id=?",id,requestId).stream().findFirst();
    }
    public boolean replayMatches(long id, UUID requestId, long actorId, String status, String carrier, String tracking) {
        return jdbc.queryForObject("select count(*) from shipment_event where shipment_id=? and request_id=? and actor_id=? and status=? "
            +"and coalesce(carrier,'')=? and coalesce(tracking_number,'')=?",
            Long.class,id,requestId,actorId,status,carrier==null?"":carrier,tracking==null?"":tracking)==1;
    }
    public void update(Row row, String status, String carrier, String tracking, Instant now) {
        jdbc.update("update shipment set status=?,carrier=?,tracking_number=?,updated_at=?,version=version+1 where id=?",
            status,carrier,tracking,Timestamp.from(now),row.id());
    }
    public List<Row> page(Long storeId, ShipmentStatus status, int page, int size) {
        var args=new ArrayList<Object>();String where=where(storeId,status,args);args.add(size);args.add((long)page*size);
        return jdbc.query("select * from shipment"+where+" order by id desc limit ? offset ?",this::row,args.toArray());
    }
    public long count(Long storeId, ShipmentStatus status) {
        var args=new ArrayList<Object>();String where=where(storeId,status,args);
        return jdbc.queryForObject("select count(*) from shipment"+where,Long.class,args.toArray());
    }
    private String where(Long storeId, ShipmentStatus status, List<Object> args) {
        List<String> clauses=new ArrayList<>();
        if(storeId!=null){clauses.add("store_id=?");args.add(storeId);}
        if(status!=null){clauses.add("status=?");args.add(status.name());}
        return clauses.isEmpty()?"":" where "+String.join(" and ",clauses);
    }
    public ShipmentView view(Row row) { return views(List.of(row)).getFirst(); }
    public List<ShipmentView> views(List<Row> rows) {
        if(rows.isEmpty()) return List.of();
        var named=new org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate(jdbc);
        var parameters=Map.of("ids",rows.stream().map(Row::id).toList());
        Map<Long,List<ShipmentView.Line>> items=new HashMap<>();
        Map<Long,List<ShipmentView.Event>> events=new HashMap<>();
        record Context(String address,String store) {}
        Map<Long,Context> contexts=new HashMap<>();
        named.query("select si.shipment_id,i.product_id,i.product_name,i.count from shipment_item si join order_item i on i.id=si.order_item_id where si.shipment_id in (:ids) order by i.id",parameters,(org.springframework.jdbc.core.RowCallbackHandler)rs -> {
            items.computeIfAbsent(rs.getLong(1),ignored->new ArrayList<>()).add(new ShipmentView.Line(rs.getLong(2),rs.getString(3),rs.getInt(4)));
        });
        named.query("select * from shipment_event where shipment_id in (:ids) order by id",parameters,(org.springframework.jdbc.core.RowCallbackHandler)rs -> {
            events.computeIfAbsent(rs.getLong("shipment_id"),ignored->new ArrayList<>()).add(new ShipmentView.Event(rs.getLong("id"),rs.getString("status"),rs.getString("carrier"),rs.getString("tracking_number"),
                (Long)rs.getObject("actor_id"),rs.getTimestamp("recorded_at").toInstant(),rs.getString("kind")));
        });
        named.query("select s.id,o.shipping_address,st.name from shipment s join customer_order o on o.id=s.order_id left join store st on st.id=s.store_id where s.id in (:ids)",parameters,(org.springframework.jdbc.core.RowCallbackHandler)rs -> {
            contexts.put(rs.getLong(1),new Context(rs.getString(2),rs.getString(3)));
        });
        return rows.stream().map(r->{var context=contexts.get(r.id());return new ShipmentView(r.id(),r.orderId(),r.storeId(),context.store(),r.status(),r.version(),r.carrier(),r.tracking(),r.created(),r.updated(),r.historical(),context.address(),items.getOrDefault(r.id(),List.of()),events.getOrDefault(r.id(),List.of()));}).toList();
    }
}
