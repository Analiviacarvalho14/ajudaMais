package projeto.ajudagov.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import projeto.ajudagov.entity.Doacao;
import projeto.ajudagov.repository.DoacaoRepository;

import java.util.List;

@Service
public class DoacaoService {

    private final DoacaoRepository doacaoRepository;

    public DoacaoService(DoacaoRepository doacaoRepository) {
        this.doacaoRepository = doacaoRepository;
    }

    @Transactional
    public void adicionar(Doacao doacao){
        this.doacaoRepository.save(doacao);
    }

    public List<Doacao> listar(){
        return this.doacaoRepository.findAll();
    }

    @Transactional
    public void atualizar(Long id, Doacao doacao){
        Doacao DoacaoAtualizado = this.doacaoRepository.findById(id).orElseThrow(() -> new RuntimeException("Doacao não encontrado"));
        DoacaoAtualizado.setTipo(doacao.getTipo());
        DoacaoAtualizado.setData(doacao.getData());

    }

    @Transactional
    public void remover(Long id){
        this.doacaoRepository.findById(id).orElseThrow(() -> new RuntimeException("Doação não encontrado"));
        this.doacaoRepository.deleteById(id);
    }
}

