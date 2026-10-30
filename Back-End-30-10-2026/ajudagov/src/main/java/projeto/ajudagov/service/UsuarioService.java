package projeto.ajudagov.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import projeto.ajudagov.entity.Usuario;
import projeto.ajudagov.repository.UsuarioRepository;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.security.*;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Optional<Usuario> findByEmail(String email){
        return this.usuarioRepository.findByEmail(email);
    }

    @Transactional
    public void adicionar(Usuario usuario) throws Exception {
        usuario.setSenha(sha256(usuario.getSenha()));
        this.usuarioRepository.save(usuario);
    }

    public List<Usuario> listar(){
        return this.usuarioRepository.findAll();
    }

    @Transactional
    public void atualizar(String id, Usuario usuario) throws Exception {
        Usuario usuarioAtualizado = this.usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuarioAtualizado.setNome(usuario.getNome());
        usuarioAtualizado.setEmail(usuario.getEmail());
        usuarioAtualizado.setTelefone(usuario.getTelefone());

        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) {
            usuarioAtualizado.setSenha(sha256(usuario.getSenha()));
        }
    }

    @Transactional
    public void remover(String id){
        Usuario usuarioEncontrado = this.usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        this.usuarioRepository.delete(usuarioEncontrado);
    }

    public static String sha256(String senha) throws Exception{
        MessageDigest m = MessageDigest.getInstance("SHA-256");
        m.reset();
        m.update(senha.getBytes(StandardCharsets.UTF_8));
        return String.format("%064x", new BigInteger(1,m.digest()));
    }
}

