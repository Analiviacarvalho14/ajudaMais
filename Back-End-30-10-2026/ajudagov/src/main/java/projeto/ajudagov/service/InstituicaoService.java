package projeto.ajudagov.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import projeto.ajudagov.entity.Instituicao;
import projeto.ajudagov.repository.InstituicaoRepository;

import java.util.List;
import java.util.Optional;

import static projeto.ajudagov.service.UsuarioService.sha256;

@Service
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;

    public InstituicaoService(InstituicaoRepository instituicaoRepository) {
        this.instituicaoRepository = instituicaoRepository;
    }

    public Optional<Instituicao> findByEmail(String email){
        return this.instituicaoRepository.findByEmail(email);
    }

    @Transactional
    public void adicionar(Instituicao instituicao) throws Exception {
        instituicao.setSenha(sha256(instituicao.getSenha()));
        this.instituicaoRepository.save(instituicao);
    }

    public List<Instituicao> listar(){
        return this.instituicaoRepository.findAll();
    }

    public Instituicao pegarPorId(String cnpj){
        return this.instituicaoRepository.findById(cnpj).orElseThrow(() -> new RuntimeException("Instituição não encontrada."));
    }

    @Transactional
    public void atualizar(String cnpj, Instituicao instituicao) throws Exception {
        Instituicao instituicaoAtualizada = this.instituicaoRepository.findById(cnpj)
                .orElseThrow(() -> new RuntimeException("Instituicão não encontrada"));
        instituicaoAtualizada.setNome(instituicao.getNome());
        instituicaoAtualizada.setEmail(instituicao.getEmail());
        instituicaoAtualizada.setTelefone(instituicao.getTelefone());
        instituicaoAtualizada.setDescricao(instituicao.getDescricao());
        instituicaoAtualizada.setPix(instituicao.getPix());
        instituicaoAtualizada.setAtuacao(instituicao.getAtuacao());
        instituicaoAtualizada.setRegiao(instituicao.getRegiao());
        instituicaoAtualizada.setUrgencia(instituicao.getUrgencia());

        if (instituicao.getSenha() != null && !instituicao.getSenha().isBlank()) {
            instituicaoAtualizada.setSenha(sha256(instituicao.getSenha()));
        }

    }

    @Transactional
    public void remover(String cnpj){
        Instituicao instituicaoExistente = this.instituicaoRepository.findById(cnpj).orElseThrow(() -> new RuntimeException("Instituicão não encontrado"));
        this.instituicaoRepository.delete(instituicaoExistente);
    }
}

