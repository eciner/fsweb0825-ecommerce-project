package com.eciner.ecommerce.address;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;

@Service
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list(Long ownerId) {
        return addressRepository.findAllByOwner_IdOrderByIdAsc(ownerId).stream()
                .map(AddressResponse::from).toList();
    }

    public AddressResponse create(Long ownerId, AddressRequest request) {
        User owner = requireUser(ownerId);
        Address address = new Address(owner, request.title().trim(), request.name().trim(),
                request.surname().trim(), request.phone().trim(), request.city().trim(),
                request.district().trim(), request.neighborhood().trim());
        return AddressResponse.from(addressRepository.save(address));
    }

    public AddressResponse update(Long ownerId, AddressUpdateRequest request) {
        Address address = requireOwnedAddress(request.id(), ownerId);
        address.update(request.title().trim(), request.name().trim(), request.surname().trim(),
                request.phone().trim(), request.city().trim(), request.district().trim(),
                request.neighborhood().trim());
        return AddressResponse.from(addressRepository.save(address));
    }

    public void delete(Long ownerId, Long addressId) {
        addressRepository.delete(requireOwnedAddress(addressId, ownerId));
    }

    private User requireUser(Long ownerId) {
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated user was not found."));
    }

    private Address requireOwnedAddress(Long addressId, Long ownerId) {
        return addressRepository.findByIdAndOwner_Id(addressId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("ADDRESS_NOT_FOUND", "Address was not found."));
    }
}