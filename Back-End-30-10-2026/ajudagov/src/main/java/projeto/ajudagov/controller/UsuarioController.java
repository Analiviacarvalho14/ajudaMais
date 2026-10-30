package projeto.ajudagov.controller;

import jakarta.servlet.http.*;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import projeto.ajudagov.dto.UsuarioDTO;
import projeto.ajudagov.entity.Usuario;
import projeto.ajudagov.service.UsuarioService;
import jakarta.persistence.*;

import java.util.List;
import java.util.Optional;

import static projeto.ajudagov.service.UsuarioService.sha256;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @RequestMapping("/login")
    public ResponseEntity<String> login(@RequestBody UsuarioDTO usuarioDto, HttpSession session) throws Exception {
        Optional<Usuario> usuarioTmp = this.usuarioService.findByEmail(usuarioDto.getEmail());

        if (usuarioTmp.isPresent()) {
            session.setAttribute("usuario", usuarioTmp);

            if ((sha256(usuarioDto.getSenha())).equals(usuarioTmp.get().getSenha())) {
                return ResponseEntity.ok("Login efetuado com sucesso. Seja bem-vind@ " + usuarioTmp.get().getNome() + ".");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("A senha está incorreta!");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado.");
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
    public ResponseEntity<Usuario> adicionar(@RequestBody Usuario usuario) throws Exception {
        usuarioService.adicionar(usuario);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    public List<Usuario> listar(){
        return this.usuarioService.listar();
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(@PathVariable String id, @RequestBody Usuario usuario) throws Exception {
        this.usuarioService.atualizar(id, usuario);
        return ResponseEntity.ok("Usuário atualizado com sucesso!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable String id) {
        this.usuarioService.remover(id);
        return ResponseEntity.ok("Usuário removido com sucesso!");
    }
}
