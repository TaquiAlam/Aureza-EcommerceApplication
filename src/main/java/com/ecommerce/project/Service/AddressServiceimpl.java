package com.ecommerce.project.Service;

import com.ecommerce.project.Exception.ResourceNotFoundException;
import com.ecommerce.project.Model.Address;
import com.ecommerce.project.Model.User;
import com.ecommerce.project.Payload.AddressDTO;
import com.ecommerce.project.Repositories.AddressRepo;
import com.ecommerce.project.Repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class AddressServiceimpl implements AddressService {

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private UserRepository userRepository;

    @Override
    public AddressDTO createAddress(AddressDTO addressDTO, User user) {
        Address address = modelMapper.map(addressDTO, Address.class);
        address.setUser(user);
        List<Address> addressesList = user.getAddresses();
        addressesList.add(address);
        user.setAddresses(addressesList);
        Address savedAddress = addressRepo.save(address);
        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getAddresses() {
        List<Address> addresses = addressRepo.findAll();
        return addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .toList();
    }

    @Override
    public AddressDTO getAddressesById(Long addressId) {
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));
        return modelMapper.map(address, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getUserAddresses(User user) {
        List<Address> addresses = user.getAddresses();
        return addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .toList();
    }

    @Override
    public AddressDTO updateAddress(Long addressId, AddressDTO addressDTO) {
        Address addressfromDB=addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        addressfromDB.setCity(addressDTO.getCity());
        addressfromDB.setPincode(addressDTO.getPincode());
        addressfromDB.setState(addressDTO.getState());
        addressfromDB.setCountry(addressDTO.getCountry());
        addressfromDB.setStreetAddress(addressDTO.getStreetAddress());
        addressfromDB.setBuildingName(addressDTO.getBuildingName());

        Address updatedAddress = addressRepo.save(addressfromDB);

        User user = addressfromDB.getUser();
        user.getAddresses().removeIf(address -> address.getAddressId().equals(addressId));
        user.getAddresses().add(updatedAddress);
        userRepository.save(user);

        return modelMapper.map(updatedAddress, AddressDTO.class);

    }

    @Override
    public String deleteAddress(Long addressId) {
        Address addressFromDatabase = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        User user = addressFromDatabase.getUser();
        user.getAddresses().removeIf(address -> address.getAddressId().equals(addressId));
        userRepository.save(user);

        addressRepo.delete(addressFromDatabase);

        return "Address deleted successfully with addressId: " + addressId;
    }
}
