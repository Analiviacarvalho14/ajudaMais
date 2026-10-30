package projeto.ajudagov.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Doacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "usuario_cpf", referencedColumnName = "cpf", foreignKey=@ForeignKey(name = "Fk_usuario_cpf_doacao"))
    private Usuario usuario;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "instituicao_cnpj", referencedColumnName = "cnpj", foreignKey=@ForeignKey(name = "Fk_instituicao_cnpj_cnpj"))
    private Instituicao instituicao;

    private String tipo;
    private String data;
    private int quantidade;
}

