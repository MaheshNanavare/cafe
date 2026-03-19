package org.crud.cafe.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Sequential ID
    private Long id;
    private String name;
    private String email;
    private int age;

    public Customer() {}

    public Customer(String name, String email, int age) {
        this.name = name;
        this.email = email;
        this.age = age;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}