import fs from 'fs-extra';
import path from 'path';

export async function addDefaultController(projectDir, packageName) {
  const basePackage = packageName || 'com.example';
  const packagePath = basePackage.replace(/\./g, '/');
  const controllerDir = path.join(projectDir, 'src/main/java', packagePath);

  await fs.ensureDir(controllerDir);

  const controllerContent = `package ${basePackage};

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/hello")
    public Map<String, Object> hello(@RequestParam(required = false) String name) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", name != null ? "Hello, " + name + "!" : "Hello from Spring Boot!");
        response.put("status", "ok");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return response;
    }

    @PostMapping("/echo")
    public Map<String, Object> echo(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>(body);
        response.put("echoed", true);
        return response;
    }
}
`;

  await fs.writeFile(path.join(controllerDir, 'ApiController.java'), controllerContent);
}
