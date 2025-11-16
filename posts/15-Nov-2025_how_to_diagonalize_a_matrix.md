<!-- ## How to Diagonalize a Matrix? -->



The direct approach to diagonalising a dense matrix using linear algebra routines like LAPACK consists of two steps. The first step is to transform the matrix into Tridiagonal Form and then do the eigen decompositon of the resultant tridiagonal matrix through methods like QR decomposition. LAPACK prefers this approach over the naive approach of solving the characteristic equation $det(A- \ lambda I)$ due to numerical instability.  However, the direct approach only works with normal/hermitian matrices as they satisfy the [spectral theorem](https://en.wikipedia.org/wiki/Spectral_theorem).



Non-symmetric/hermitian matrices in general do not satisfy the spectral theorem and could be [defective](https://en.wikipedia.org/wiki/Defective_matrix). In other words, some of the non-hermitian matrices not have a complete set of eigenbasis and hence will not be diagonalizable. Our aim is to diagonalize the Linbladian, which in its matrix form is non-Hermitian, thus direct methods could fail. Although there is a very recent work that claims almost all Linbladians (Quantum Channels in general) are diagonalizable [1], I currently lacks the mathematical rigor to fully appreciate the results :). 



LAPACK takes an alternative route to diagonalise non-Hermitian matrices, since working with defective and close to defective matrices could cause numerical instabilities. LAPACK would first transform the matrix in to a Triangular (or quasi-triangular in some cases) matrix known as [Schur Matrix](https://en.wikipedia.org/wiki/Schur_decomposition). Then uses algorithms like QR decomposition to find the eigenvalues and eigenvectors of the Schur matrix. As Schur decomposition is a [similarity transfomation](https://en.wikipedia.org/wiki/Matrix_similarity), it guarantees to share eigenvalues with the original matrix. Further, with a little bit of effort, we could get the eigenvectors of the original matrix from the eigenvectors of the Schur matrix.


Although Schur decomposition provides numerical robustness for non-Hermitian problems, Schur decomposition has its price. For matrices of size $N>3$ there is in general no finite algorithm that reduces the matrix directly to Schur form [2]. Thus, the standard practical approach is to first reduce the matrix to an [upper-Hessenberg]((https://en.wikipedia.org/wiki/Hessenberg_matrix)) form using finite Householder or Givens transformations, and then apply an iterative QR procedure to obtain the Schur form. However, for our purposes it is more useful to employ an iterative algorithm called Arnoldi iteration, which constructs the Hessenberg matrix using only matrix–vector (or operator–vector) products.

The main advantage of using Arnoldi iteration is that it does not require explicit access to the matrix representation of the Lindbladian. Instead, it only requires a routine that evaluates $\mathcal{L}\rho$, treating the Lindbladian as a black box:

<!-- Thus, the standard approach is to reduce the original matrix into an Upper [Hessenberg matrix](https://en.wikipedia.org/wiki/Hessenberg_matrix) and then perform a QR decomposition to construct the Schur Form. There are some direct approaches like Householder's transformation, Givens rotation, etc, which can be used to reduce any matrix into upper-Hessenberg form in a finite number of steps. However, we are interested in an iterative algorithm called Arnoldi iteration to construct the Hessenberg Matrix, as it seems most suited for our objective of diagonalizing a Lindbladian.


The main advantage using Arnoldi iteration is that it does not require the matrix form Linbladian to construct the Hessenberg matrix. Arnoldi iteration only requires a routine that computes $\mathcal{L}\rho$ and treats the form of Linbladian as a black box. -->

``` 
                               _ _ _ _ _ _ _
                              |             |
                     ρ  --->  |   Blackbox  | ---> Lρ 
                              |_ _ _ _ _ _ _|
```
The operation $L\rho$ can be computed directly from Linblad-Master Equation, without requiring the full matrix representation of Linbladian. This is advantangeous as it involves only matrix multiplications of cost $\mathcal{O(n^3)}$, compared to $\mathcal{O(n^6)}$ operations while working with the Linbladian matrix, where $n$ is the quantum system size. 



Moreover, Arnoldi iteration is a **Krylov-subspace method** that approximately constructs the Hessenberg matrix in a subspace spanned by the dominant eigenvectors of the operator to be diagonalised. The dimension of this subspace can be controlled by fixing the number of iterations $k$, allowing one to balance accuracy against computational cost. Overall, the complexity of Arnoldi iteration scales $\mathcal{O(kn^{3}+k^{2}n^{2})}$ and naturally naturally provides partial spectral information, which is quite useful while working with defective matrices that exhibit numerical instabilities.



**References :**

1. [Almost All Quantum Channels Are Diagonalizable](https://ui.adsabs.harvard.edu/abs/2024OSID...3150012V/)

2. [Non-Hermitian Eigenvalue Problems](https://www.netlib.org/utk/people/JackDongarra/etemplates/node204.html)
