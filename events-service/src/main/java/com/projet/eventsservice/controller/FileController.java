package com.projet.eventsservice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // POST /api/files/upload
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Fichier vide");
            }

            // s'assurer que le répertoire existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // nom fichier simple : timestamp_nomoriginal
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath);

            // URL d'accès au fichier
            String fileUrl = "/api/files/" + fileName;
            return ResponseEntity.ok(fileUrl);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload du fichier");
        }
    }

    // GET /api/files/{filename}
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] data = Files.readAllBytes(filePath);

            // on laisse simple : content-type générique binaire
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            return new ResponseEntity<>(data, headers, HttpStatus.OK);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
