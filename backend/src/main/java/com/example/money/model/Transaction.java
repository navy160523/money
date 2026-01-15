package com.example.money.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {
    private String id;
    private String type; // plus or minus
    private Double amount;
    private String category;
    private String date; // ISO String
}
