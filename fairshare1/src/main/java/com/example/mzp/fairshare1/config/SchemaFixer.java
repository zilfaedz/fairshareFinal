package com.example.mzp.fairshare1.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class SchemaFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner fixSchema() {
        return args -> {
            try {
                System.out.println("Running Schema Fixer...");
                // Modify the column to be VARCHAR(50) to support all enum values
                jdbcTemplate.execute("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50)");
                System.out.println("Schema Fixer: Successfully modified 'type' column in 'notifications' table.");
            } catch (Exception e) {
                System.out.println("Schema Fixer: Failed explicitly (might already be fixed or table missing). Error: "
                        + e.getMessage());
            }
        };
    }
}
