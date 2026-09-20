package com.ecommerce.project.Service;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceimpl implements FileService{
    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();

        String ext = ".jpg";
        if (originalFileName != null && originalFileName.contains(".")) {
            ext = originalFileName.substring(originalFileName.lastIndexOf('.'));
        }

        String randomId = UUID.randomUUID().toString();
        String fileName = randomId.concat(ext);

        File folder = new File(path);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String filePath = path + (path.endsWith(File.separator) ? "" : File.separator) + fileName;

        Files.copy(file.getInputStream(), Paths.get(filePath), java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }
}
