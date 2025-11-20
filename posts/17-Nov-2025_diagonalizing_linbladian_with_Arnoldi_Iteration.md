<!-- # Diagonalizing Linbladian with Arnoldi Iteration -->
 
The crux of Arnoldi iteration is to construct the Hessenberg Matrix from the Linbladian in the [Krylov Subspace](https://en.wikipedia.org/wiki/Krylov_subspace). The Krylov subspace will spanned by the basis vectors ｛ $\rho,\mathcal{L\rho},\mathcal{L}^{2}\rho,\cdots \mathcal{L}^{k-1}\rho$｝ which is non-orthogonal in nature. To make the basis orthogonal, we can employ [Gram-Schmidt Process](https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process) (or one of its variants). Orthogonalisation of the basis vectors iteratively makes them linearly independent and helps to improve the numerical stability of the algorithm. Eigenvalues and eigenvectors of a Hessenberg matrix are called Ritz vectors and Ritz values, and are guaranteed to be a good approximation of the eigenspectrum of Linbladain according to [Rayleigh-Ritz Method](https://en.wikipedia.org/wiki/Rayleigh%E2%80%93Ritz_method).

The reduction of Linbladian to Hessenberg form from an initial density matrix $\rho_{0}$ as follows:
<!-- ***
   1. Normalize $\rho_{0}$
   2. Append $\rho_{0}$ to $Q_{m}$.
   3. **For** $j = 0$ **to** $k-1$:
      1. $\rho_{j+1} := \mathcal{L}\rho_{j}$
      2. **For** $i = 0$ **to** $j$:
         - $H_{(i,j)} := \mathrm{ComputeInnerProduct}(\rho_{i}, \rho_{j})$

         - $\rho_{j+1} ← \rho_{j+1} - H_{(i,j)}\rho_{i}$   (*_Modified Gram-Schmidt Orthogonalization_*)
      3. $H_{(j+1,j)} := \mathrm{ComputeInnerProduct}(\rho_{j+1}, \rho_{j+1})$
      4. Normalize $\rho_{j+1}$.
      5. Append $\rho_{j+1}$ to $Q_{m}$.
*** -->

```
q0 := rho0 / ||rho0||                      # normalize with Hilbert-Schmidt norm
Q[:,0] := q0
for j = 0 .. m-1:
    v := L( Q[:,j] )                       # apply Lindbladian (do NOT form L explicitly)
    for i = 0 .. j:
        h[i,j] := < Q[:,i], v >            # Hilbert-Schmidt: Tr(Q_i^† v)
        v := v - h[i,j] * Q[:,i]           # Modified Gram-Schmidt
    end
    h[j+1,j] := sqrt( < v, v > )
    if h[j+1,j] == 0: stop (happy breakdown)
    Q[:,j+1] := v / h[j+1,j]
end
# H is the (m x m) upper Hessenberg matrix with entries h[*,*]
```

The resultant Hessenberg matrix is real because each entry is obtained from the Hilbert–Schmidt inner product of two Hermitian matrices. Due to its upper-triangular like structure, an Hessenberg matrix could be efficiently diagonalized compared to its original form. LAPACK has specialized functions that could do diagonalization of a Hessenberg matrix efficiently, as follows.
<!-- ```
                     _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                    |                                             |
                    |       Upper Hessenberg Matrix (H)           |          
                    | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |
                                        |
                                        |  dhseqr with Z = I
                                        \/
                     _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                    |                                             |
                    |     Schur Form T + Schur Vector Z           |          
                    | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |
                                        |
                                        |  dtrvec   
                                        \/
                     _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                    |                                             |
                    |           Eigen vectors of T (V_T)          |          
                    | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |
                                        |
                                        |  multiply Z x V_T
                                        \/
                     _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                    |                                             |
                    |          Eigen Vectors of H (V_H)           |          
                    | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |

``` -->

```
                        ┌─────────────────────────────────┐
                        │                                 │                                               
                        │    Upper Hessenberg Matrix (H)  │                                               
                        │                                 │                                               
                        └───────────────┬─────────────────┘                                               
                                        │                                                                 
                                        │ dhseqr with Z = I                                               
                                        │                                                                 
                        ┌───────────────▼─────────────────┐                                               
                        │                                 │                                               
                        │  Schur Form T + Schur Vector Z  │                                               
                        │                                 │                                               
                        └───────────────┬─────────────────┘                                               
                                        │                                                                 
                                        │ dtrvec                                                          
                                        │                                                                 
                        ┌───────────────▼─────────────────┐                                               
                        │                                 │                                               
                        │     Eigen vectors of T (V_T)    │                                               
                        │                                 │                                               
                        └───────────────┬─────────────────┘                                               
                                        │                                                                 
                                        │ multiply Z x V_T                                                
                                        │                                                                 
                        ┌───────────────▼─────────────────┐                                               
                        │                                 │                                               
                        │     Eigen Vectors of H (V_H)    │                                               
                        │                                 │                                               
                        └─────────────────────────────────┘                                               
```

The `dhseqr` routines convert a Hessenberg matrix to a Schur matrix via QR decompositions. A Schur matrix has an upper-triangular (or block upper triangular) structure, and its eigenvalues can be directly obtained from the diagonal entries, which form the Ritz values. Further, the eigenvectors of the Schur matrix could be found using the `dtrvec` routine, and they could be transformed into eigenvectors of the Hessenberg matrix. Ritz vectors could be found from eigenvectors of the Hessenberg matrix as follows;

$$\text{ritz vectors} = Q_m * V_H$$

Note that the resulting Ritz vectors need not be Hermitian. This is expected as the eigenoperators of a Lindbladian superoperator are non-Hermitian, except for special cases such as the steady-state eigenoperator corresponding to eigenvalue zero.