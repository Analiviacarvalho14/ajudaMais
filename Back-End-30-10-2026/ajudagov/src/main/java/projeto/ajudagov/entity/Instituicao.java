package projeto.ajudagov.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Instituicao {
    @Id
    private String cnpj;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "contaBancaria_id", referencedColumnName = "id", foreignKey=@ForeignKey(name = "Fk_contaBancariaInstituicao_id"))
    private ContaBancaria contaBancaria;

    @NotBlank
    private String nome;

    @NotBlank
    private String senha;

    @NotBlank
    private String email;

    @NotBlank
    private String descricao;

    @NotBlank
    private String pix;

    @NotBlank
    private String telefone;

    @NotBlank
    private String regiao;

    @NotBlank
    private String atuacao;

    @NotBlank
    private String urgencia;

    private String imagem;
}

