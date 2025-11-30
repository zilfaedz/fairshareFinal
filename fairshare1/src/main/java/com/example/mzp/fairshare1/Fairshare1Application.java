package com.example.mzp.fairshare1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Fairshare1Application {

	public static void main(String[] args) {
		try {
			SpringApplication.run(Fairshare1Application.class, args);
		} catch (Exception ex) {
			if (ex.getClass().getName().contains("SilentExitException")) {
				// Skip processing for SilentExitException
				return;
			}
			System.err.println(
					"Application failed to start. Common cause: database connection or JPA setup problem. See exception below:");
			ex.printStackTrace();
			// Suggest common remediation steps
			System.err.println(
					"If this is a DB connection error, verify MySQL is running and the credentials in application.properties (or DB_USER/DB_PASS env vars) are correct.");
			System.exit(1);
		}
	}

}
