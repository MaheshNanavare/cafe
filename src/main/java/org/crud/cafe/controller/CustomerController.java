package org.crud.cafe.controller;

import org.crud.cafe.model.Customer;
import org.crud.cafe.repository.CustomerRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {
    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Customer> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer updatedCustomer) {
        return repository.findById(id)
                .map(customer -> {
                    customer.setName(updatedCustomer.getName());
                    customer.setEmail(updatedCustomer.getEmail());
                    customer.setAge(updatedCustomer.getAge());
                    return repository.save(customer);
                })
                .orElseGet(() -> {
                    updatedCustomer.setId(id);
                    return repository.save(updatedCustomer);
                });
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}