package projeto.ajudagov.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projeto.ajudagov.dto.InstituicaoDTO;
import projeto.ajudagov.entity.Instituicao;
import projeto.ajudagov.entity.Usuario;
import projeto.ajudagov.service.InstituicaoService;

import java.util.List;
import java.util.Optional;

import static projeto.ajudagov.service.UsuarioService.sha256;

@RestController
@RequestMapping("/instituicao")
@CrossOrigin(origins = "*")
public class InstituicaoController {

    private final InstituicaoService instituicaoService;

    public InstituicaoController(InstituicaoService instituicaoService) {
        this.instituicaoService = instituicaoService;
    }

    @RequestMapping("/login")
    public ResponseEntity<String> login(@RequestBody InstituicaoDTO instituicaoDto, HttpSession session) throws Exception {
        Optional<Instituicao> instituicaoTmp = this.instituicaoService.findByEmail(instituicaoDto.getEmail());

        if (instituicaoTmp.isPresent()) {
            session.setAttribute("instituicao", instituicaoTmp);

            if ((sha256(instituicaoDto.getSenha())).equals(instituicaoTmp.get().getSenha())) {
                return ResponseEntity.ok("Login efetuado com sucesso. Seja bem-vind@ " + instituicaoTmp.get().getNome());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("A senha está incorreta!");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Instituição não encontrada.");
        }
    }

    @RequestMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response){
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        } else {
            return ResponseEntity.badRequest().body("Não foi possível encerrar sua sessão.");
        }

        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok("Sessão encerrada com sucesso!");
    }

    @PostMapping
    public ResponseEntity<Instituicao> adicionar(@RequestBody Instituicao instituicao) throws Exception {
        instituicaoService.adicionar(instituicao);
        return ResponseEntity.ok(instituicao);
    }

    @GetMapping
    public List<Instituicao> listar(){
        return this.instituicaoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instituicao> pegarPorId(@PathVariable String id){
        Instituicao instituicaoEncontrada = instituicaoService.pegarPorId(id);
        return ResponseEntity.ok(instituicaoEncontrada);

    }

    @PutMapping("/{cnpj}")
    public ResponseEntity<String> atualizar(@PathVariable String cnpj, @RequestBody Instituicao instituicao) throws Exception {
        this.instituicaoService.atualizar(cnpj, instituicao);
        return ResponseEntity.ok("Instituicão atualizada com sucesso!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable String id, @RequestBody InstituicaoDTO instituicaoDto, HttpSession session) throws Exception {
        this.instituicaoService.remover(id);
        return ResponseEntity.ok("Instituição removida com sucesso!");
    }
}
