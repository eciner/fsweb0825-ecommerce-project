package com.eciner.ecommerce.address;

public record AddressResponse(Long id, String title, String name, String surname, String phone,
        String city, String district, String neighborhood) {

    public static AddressResponse from(Address address) {
        return new AddressResponse(address.getId(), address.getTitle(), address.getName(),
                address.getSurname(), address.getPhone(), address.getCity(), address.getDistrict(),
                address.getNeighborhood());
    }
}