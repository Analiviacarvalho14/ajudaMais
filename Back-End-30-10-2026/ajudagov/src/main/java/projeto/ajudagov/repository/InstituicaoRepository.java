package projeto.ajudagov.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ajudagov.entity.Instituicao;
import projeto.ajudagov.entity.Usuario;

import java.util.Optional;

public interface InstituicaoRepository extends JpaRepository<Instituicao, String> {
    Optional<Instituicao> findByEmail(String email);
}
