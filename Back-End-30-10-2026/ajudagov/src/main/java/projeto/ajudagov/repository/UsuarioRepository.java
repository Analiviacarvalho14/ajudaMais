package projeto.ajudagov.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ajudagov.entity.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
}


