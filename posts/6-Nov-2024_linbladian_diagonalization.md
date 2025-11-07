# Diagonalizing Linbladian
The [Linblad-Master Equation](https://en.wikipedia.org/wiki/Lindbladian) describes evolution of a quantum system weakly coupled to a memoryless (Markovian) environment. 

$$
\frac{\partial \rho}{\partial t} = \mathcal{L}\rho = -i\left[\hat{H},\rho\right] + \sum_{k} \gamma_{k} \left(L_{k}\rho L_{k}^{\dagger} - \frac{1}{2}\{L_{k}^{\dagger}L_{k},\rho\}\right) 
$$

Here, $\mathcal{L}$ denotes Linbladian or Liouvillian Superoperator, which is mathematically a [Completely Postive Trace Preserving Map](https://www.cs.umd.edu/class/fall2024/cmsc657/Lecture-4.pdf). The system Hamiltonian is represented by $\hat{H}$ and state of system by density matrix $\rho$.  The first part of the equation governs the coherent evolution of the system, whereas the second part governs dissipation happening to the environment. The dissipation is modelled using Jump operators (or collapse operators) $\hat{L_{k}}$. The rate of dissipation or decay is controlled by the parameter $\gamma_{k}$. The Linblad-Master equation is efficient in modelling phenomenas qubit relaxation and decoherence, spontaneous emission of atoms in a cavity, dynamics of weakly coupled electronic systems and so more.

Studying dynamics of the system at short time regimes could be done efficiently by solving the Linblad-Master equation via numerical integration methods. However, to study the relaxation behaviour or long time regime dynamics, diagonalizing the linbladian offers a much better approach [1]. Diagonalizing Linbladian which is a Map (or a Superoperator), is not straight forward as diagonalizing a matrix (or an operator). The straight forward approach is to represent the Linbladian as a matrix through vectorization of the density matrix [2]. In this approach, the ($n\times n$) density matrix are vectorized to form ($n^{2}\times 1$) vector (called "supervectors").  These vectorized density matrix forms basis a linear vector space of the dimension $n^{2}$ called Fock-Liouville space [3]. 

In the Fock-Liouville space, the Linbladian could be represented as $(n^{2} \times n^{2})$ complex non-hermitian matrix $\tilde{\mathcal{L}}$. In general, a complex non-Hermitian does not obey spectral theorem, meaning they would not have orthogonal set of eigenvectors. The spectral decomposition of Linbladian allowa us to write the state of the system at any time from initial state $\rho_{0}$ as;

$$
\rho(t) = \mathcal{e}^{\tilde{\mathcal{L}t}}\rho_{0} = r_{1} + \sum_{k=2}^{d^{2}} e^{\lambda_{k}} \text{Tr}(l_{k}\rho_{0})r_{k}
$$

where, $d$ is the dimension of the Hilbert space and $(r_k, l_{k}, \lambda_{k})$ corresponds to the right eigenmatrices, left eigenmatrices and eigenvalues of non-Hermitian Linbladian matrix [4]. The eigenmodes $(r_k, l_k)$ describe independent decay channels of the system, with $\lambda_k$ encoding their relaxation rates. The mode corresponding to $\lambda_1 = 0$ represents the steady state. In other words, $r_1$ corresponds to the steady state of the open quantum system. Thus, diagonalizing Linbladian is useful as it allows one to describe both the transient state and steady state density matrices of open quantum systems.  

<!-- They satisfy the eigenvalue equations:
$$
\mathcal{L}[r_{k}]= \lambda_{k}r_k \\

\mathcal{L}^{\dagger}[l_k] = \lambda_{k}^{*} l_{k}
$$ -->

**References**

1. [A short introduction to the Lindblad Master Equation](https://www.arxiv.org/pdf/1906.04478v1)
2. [Three approaches for representing Lindblad dynamics by a matrix-vector notation](https://arxiv.org/pdf/1510.08634)
3. [Fundamentals of Quantum Mechanics in Fock-Liouville Space](https://arxiv.org/pdf/2003.11472)

4. [Non-Hermitian Eigenvalue Problems](https://www.netlib.org/utk/people/JackDongarra/etemplates/node204.html#:~:text=In%20contrast%20to%20a%20Hermitian,orthogonal%20matrix%20to%20diagonal%20form%20.) 