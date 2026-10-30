package projeto.ajudagov.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import projeto.ajudagov.entity.ContaBancaria;

public interface ContaBancariaRepository extends JpaRepository<ContaBancaria,Long>
{
}
