package com.example.money.service;

import com.example.money.model.Transaction;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class TransactionService {

    @Autowired(required = false)
    private Firestore firestore;

    private static final String COLLECTION_NAME = "transactions";

    public List<Transaction> getAllTransactions() throws ExecutionException, InterruptedException {
        if (firestore == null) return new ArrayList<>();
        
        List<Transaction> list = new ArrayList<>();
        CollectionReference transactions = firestore.collection(COLLECTION_NAME);
        ApiFuture<QuerySnapshot> query = transactions.get();
        
        for (DocumentSnapshot document : query.get().getDocuments()) {
            Transaction tx = document.toObject(Transaction.class);
            if (tx != null) {
                tx.setId(document.getId());
                list.add(tx);
            }
        }
        return list;
    }

    public String saveTransaction(Transaction transaction) throws ExecutionException, InterruptedException {
        if (firestore == null) return "Firestore not initialized";
        
        if (transaction.getId() == null || transaction.getId().isEmpty()) {
            transaction.setId(UUID.randomUUID().toString());
        }
        
        ApiFuture<WriteResult> collectionsApiFuture = firestore.collection(COLLECTION_NAME)
                .document(transaction.getId()).set(transaction);
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public void deleteTransaction(String id) {
        if (firestore == null) return;
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }
}
