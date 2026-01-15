package com.example.money.controller;

import com.example.money.model.Transaction;
import com.example.money.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAll() throws ExecutionException, InterruptedException {
        return transactionService.getAllTransactions();
    }

    @PostMapping
    public String save(@RequestBody Transaction transaction) throws ExecutionException, InterruptedException {
        return transactionService.saveTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        transactionService.deleteTransaction(id);
    }
}
