package projeto.ajudagov.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import projeto.ajudagov.entity.ContaBancaria;
import projeto.ajudagov.repository.ContaBancariaRepository;

import java.util.List;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository contaBancariaRepository;

    public ContaBancariaService(ContaBancariaRepository contaBancariaRepository) {
        this.contaBancariaRepository = contaBancariaRepository;
    }

    @Transactional
    public void adicionar(ContaBancaria contaBancaria){
        this.contaBancariaRepository.save(contaBancaria);
    }

    public List<ContaBancaria> listar(){
        return this.contaBancariaRepository.findAll();
    }

    @Transactional
    public void atualizar(Long id, ContaBancaria contaBancaria){
        ContaBancaria ContaBancariaAtualizado = this.contaBancariaRepository.findById(id).orElseThrow(() -> new RuntimeException("Conta bancaria não encontrado"));
        ContaBancariaAtualizado.setNumeroConta(contaBancaria.getNumeroConta());
        ContaBancariaAtualizado.setAgencia(contaBancaria.getAgencia());


    }

    @Transactional
    public void remover(Long id){
        ContaBancaria ContaBancariaExistente = this.contaBancariaRepository.findById(id).orElseThrow(() -> new RuntimeException("Conta bancaria não encontrado"));
        this.contaBancariaRepository.deleteById(id);
    }
}

