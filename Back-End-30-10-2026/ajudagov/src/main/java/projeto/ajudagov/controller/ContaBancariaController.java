package projeto.ajudagov.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ajudagov.entity.ContaBancaria;
import projeto.ajudagov.service.ContaBancariaService;

import java.util.List;

@RestController
@RequestMapping("/contaBancaria")
@CrossOrigin(origins = "*")
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;

    public ContaBancariaController(ContaBancariaService contaBancariaService) {
        this.contaBancariaService = contaBancariaService;
    }

    @PostMapping
    public ResponseEntity<ContaBancaria> adicionar(@RequestBody ContaBancaria contaBancaria) {
        contaBancariaService.adicionar(contaBancaria);
        return ResponseEntity.ok(contaBancaria);
    }

    @GetMapping
    public List<ContaBancaria> listar(){
        return this.contaBancariaService.listar();
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(@PathVariable Long id, @RequestBody ContaBancaria contaBancaria) {
        this.contaBancariaService.atualizar(id, contaBancaria);
        return ResponseEntity.ok("Conta bancária atualizada com sucesso!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable Long id) {
        this.contaBancariaService.remover(id);
        return ResponseEntity.ok("Conta bancária removida com sucesso!");
    }
}
