import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

async function createMicroservice(basePackage, serviceName, outputDir) {
  const packagePath = basePackage.replace(/\./g, '/');
  const serviceDir = path.join(outputDir, 'src/main/java', packagePath, serviceName);
  
  fs.ensureDirSync(serviceDir);
  fs.ensureDirSync(path.join(serviceDir, 'model'));
  fs.ensureDirSync(path.join(serviceDir, 'repository'));
  fs.ensureDirSync(path.join(serviceDir, 'service'));
  fs.ensureDirSync(path.join(serviceDir, 'controller'));
  fs.ensureDirSync(path.join(serviceDir, 'dto'));
  fs.ensureDirSync(path.join(serviceDir, 'config'));
  
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const entityName = className;
  
  fs.writeFileSync(path.join(serviceDir, 'model', `${entityName}.java`), `package ${basePackage}.${serviceName}.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${serviceName.toLowerCase()}")
public class ${entityName} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'repository', `${className}Repository.java`), `package ${basePackage}.${serviceName}.repository;

import ${basePackage}.${serviceName}.model.${entityName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${className}Repository extends JpaRepository<${entityName}, Long> {
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'service', `${className}Service.java`), `package ${basePackage}.${serviceName}.service;

import ${basePackage}.${serviceName}.model.${entityName};
import ${basePackage}.${serviceName}.repository.${className}Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ${className}Service {
    private final ${className}Repository repository;

    public ${className}Service(${className}Repository repository) {
        this.repository = repository;
    }

    public ${entityName} create(${entityName} entity) {
        return repository.save(entity);
    }

    public List<${entityName}> findAll() {
        return repository.findAll();
    }

    public Optional<${entityName}> findById(Long id) {
        return repository.findById(id);
    }

    public ${entityName} update(Long id, ${entityName} entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'controller', `${className}Controller.java`), `package ${basePackage}.${serviceName}.controller;

import ${basePackage}.${serviceName}.model.${entityName};
import ${basePackage}.${serviceName}.service.${className}Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/${serviceName.toLowerCase()}")
public class ${className}Controller {
    private final ${className}Service service;

    public ${className}Controller(${className}Service service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<${entityName}> create(@RequestBody ${entityName} entity) {
        return ResponseEntity.ok(service.create(entity));
    }

    @GetMapping
    public ResponseEntity<List<${entityName}>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<${entityName}> findById(@PathVariable Long id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<${entityName}> update(@PathVariable Long id, @RequestBody ${entityName} entity) {
        return ResponseEntity.ok(service.update(id, entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'dto', `${className}Request.java`), `package ${basePackage}.${serviceName}.dto;

public class ${className}Request {
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'dto', `${className}Response.java`), `package ${basePackage}.${serviceName}.dto;

import java.time.LocalDateTime;

public class ${className}Response {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`);
  
  fs.writeFileSync(path.join(serviceDir, 'config', `${className}Config.java`), `package ${basePackage}.${serviceName}.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class ${className}Config {
}
`);
  
  const testDir = path.join(outputDir, 'src/test/java', packagePath, serviceName);
  fs.ensureDirSync(testDir);
  fs.writeFileSync(path.join(testDir, `${className}ServiceTest.java`), `package ${basePackage}.${serviceName};

import ${basePackage}.${serviceName}.service.${className}Service;
import ${basePackage}.${serviceName}.repository.${className}Repository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ${className}ServiceTest {
    @Mock
    private ${className}Repository repository;

    @InjectMocks
    private ${className}Service service;

    @Test
    void testCreate() {
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        var result = service.create(new ${className}());
        assertNotNull(result);
        verify(repository, times(1)).save(any());
    }
}
`);
  
  return className;
}

export async function handleAddService() {
  p.intro('Add Microservice to Project');
  
  const cwd = process.cwd();
  const pomPath = path.join(cwd, 'pom.xml');
  
  if (!fs.existsSync(pomPath)) {
    p.log.error('Not in a Spring Boot project directory (pom.xml not found).');
    process.exit(1);
  }
  
  const content = fs.readFileSync(pomPath, 'utf-8');
  const groupIdMatch = content.match(/<groupId>([^<]+)<\/groupId>/);
  const artifactIdMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
  
  const groupId = groupIdMatch ? groupIdMatch[1] : 'com.example';
  
  const serviceName = await p.text({
    message: 'Service name (e.g., user, product, order):',
    placeholder: 'my-service',
    validate: v => {
      if (!v?.trim()) return 'Required';
      if (!/^[a-z][a-zA-Z0-9]*$/.test(v)) return 'Start with lowercase, letters and numbers only';
    },
  });
  
  if (p.isCancel(serviceName)) { p.cancel('Cancelled.'); process.exit(0); }
  
  const serviceNameClean = serviceName?.trim().toLowerCase();
  const basePackage = groupId;
  
  const className = await createMicroservice(basePackage, serviceNameClean, cwd);
  
  const shouldCompile = await p.confirm({
    message: 'Compile the service now?',
    initialValue: true,
  });
  
  if (shouldCompile && !p.isCancel(shouldCompile)) {
    p.log.info('Compiling service...');
    try {
      execSync('./mvnw compile', {
        cwd: cwd,
        stdio: 'inherit',
        shell: true
      });
      p.log.success('Service compiled successfully!');
    } catch (e) {
      p.log.warn('Compilation failed. Run `mvnw compile` manually to debug.');
    }
  }
  
  p.outro(`Service created:
  src/main/java/${basePackage.replace(/\./g, '/')}/${serviceNameClean}/
    - model/${className}.java
    - repository/${className}Repository.java
    - service/${className}Service.java
    - controller/${className}Controller.java
    - dto/${className}Request.java
    - dto/${className}Response.java
    - config/${className}Config.java

API endpoint: /api/${serviceNameClean}
`);
}