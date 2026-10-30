package projeto.ajudagov.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ajudagov.entity.Doacao;
import projeto.ajudagov.service.DoacaoService;

import java.util.List;

@RestController
@RequestMapping("/doacao")
@CrossOrigin(origins = "*")
public class DoacaoController {

    private final DoacaoService doacaoService;

    public DoacaoController(DoacaoService doacaoService) {
        this.doacaoService = doacaoService;
    }

    @PostMapping
    public ResponseEntity<Doacao> adicionar(@RequestBody Doacao doacao) {
        doacaoService.adicionar(doacao);
        return ResponseEntity.ok(doacao);
    }

    @GetMapping
    public List<Doacao> listar(){
        return this.doacaoService.listar();
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(@PathVariable Long id, @RequestBody Doacao doacao) {
        this.doacaoService.atualizar(id, doacao);
        return ResponseEntity.ok("Doação atualizada com sucesso!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable Long id) {
        this.doacaoService.remover(id);
        return ResponseEntity.ok("Doação removida com sucesso!");
    }
}
