package projeto.ajudagov.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ajudagov.entity.Doacao;

public interface DoacaoRepository extends JpaRepository<Doacao, Long> {
}
