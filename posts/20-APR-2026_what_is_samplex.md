
To explain samplex, we revist example of twirling two qubit gate and measurements in Bell circuit. The direct approach to twirl would be to reconstruct the entire circuit by sandwiching target operations between Pauli gates. These Pauli gates would be generated in such a way that the logic of the target operation remains intact [1]. In this approach, the number of circuits grows with the required randomizations.


Samplomatic takes an alternative approach.  It implements twirling using dressing inside the template circuit. The dressing parameters are tuned to realize both the original circuit's gates and the randomized twirling gates. In this approach, each randomization corresponds to a specific choice of parameter values for the dressing. The number of circuits therefore remains constant regardless of the number of randomizations required.

<figure style="text-align: center;">
    <img src="./images/samplomatic/box-to-template-marked.svg"
         alt="marked-template-circuit"
         style="width:75%; height:auto;">
    <figcaption style="font-weight: bold; font-size: 14px;">
   Fig-1: Structural Similarity between boxed circuit and template circuit. The barriers L0 and R0 represent the scope of Box-1 and L1 and R1 represents the scope of Box-2. The gates between L0 (L1) and M0 (M1) is the dressing. 
    </figcaption>
</figure>

Each box has exactly one dressing, placed on the left side by default. Twirling requires random Pauli gates to be applied *symmetrically* around the target operation — one on each side. Samplomatic handles this through **gate propagation**: rather than inserting an explicit right-side gate, the inversed Pauli is absorbed into the dressing of the adjacent box.

More precisely:
- The **left twirl directive** applies a random Pauli in the current box's dressing. It then propagates the compensating inverse Pauli into the *next* box's dressing.
- The **right twirl directive** applies a random Pauli in the current box's dressing. It then propagates the compensating inverse Pauli into the *previous* box's dressing.

During propagation, gates may be mutated according to commutation relations as they pass through intervening two-qubit gates.

Beyond the twirling gates, Samplomatic also tracks the single-qubit gates originally present in the circuit. Further, when measurements are twirled, it needs computes the classical post-processing needed to correct the measurement outcomes. Samplomatic keeps track all of this using **Samplex**.

#### Journey of the virtual gates

The random Pauli gates used for twirling are considered *virtual* because they do not add any additional operations to the circuit. Instead, they act as a directive to alter how adjacent single-qubit gates are implemented. Samplomatic generally generate virtual registers on the opposite side of the dressing. In the Bell circuit, virtual registers $P\cdot P$ and $Q \cdot Q$ are generated at `R0` and `R1` respectively. The virtual registers are then propagated in both directions. 


<figure style="text-align: center;">
    <img src="./images/samplomatic/pre-samplex.svg",
         alt="marked-template-circuit"
         style="width:75%; height:auto;">
    <figcaption style="font-weight: bold; font-size: 14px;">
    Fig-2: Depiction of mutations occuring to the virtual register during propagation. 
    </figcaption>
</figure>

The virtual registers generated at `R0` propagates leftwards and rightwards. Virtual gates that propagated leftwards will first have to move past the `cz` operation. When a Pauli gate $P$ propagate across a clifford gate $C$, the Pauli gate would get transformed as $P^{'} = CPC^{\dagger}$. Thus, propagating across `cz` gate modifies or mutates the virtual register. Hadmard gate that is present in the Bell circuit is also implemented in the dressing. To implement it,  Hadamard gates are right multiplied to the virtual gates on the first qubit. After all the mutations the virtual gates will be collected into dressing (between `L0` and `M0`) as parameters.

The virtual gates propagated rightwards from `R0`  will combine with the virtual gates propagates leftwards from `R1` and gets collected in the dressing (between `L1` and `M1`). The gates propagated rightwards `R1` is a pecuilar case, as it already at the end of the circuit. Thus, they will not be applied via dressing instead as bit flips on final measurement results during post-processing. 

The important thing to note here is that If all virtual gates can be composed into a dressing, randomizations of the circuit can be built procedurally.

#### Samplex 

We can now formally introduce the Samplex. It is a core type defined in samplomatic that represents a probability distribution over parameter values for executing template circuits and classical quantities for post-processing. The Samplex encodes randomization as a graph-based procedural representation. Calling samplex.graph returns a Directed Acyclic Graph (DAG) where each node represents a process.


<figure style="text-align: center;">
    <img src="./images/samplomatic/samplex.svg",
         alt="samplex-circuit">
    <figcaption style="font-weight: bold; font-size: 14px;">
    Fig-3: Samplex from the Bell circuit. 
    </figcaption>
</figure>


A Samplex has three types of nodes:

- **Sampling Nodes** (Star Shaped) 
- **Evaluation Nodes** (Circles)
- **Collection Nodes** (Bow ties)

Sampling nodes instantiate virtual registers. Depending on the task, whether generating randomizations for twirling, sampling noise from noise models, or injecting basis, these nodes sample virtual gates from a set. Evaluation nodes represent mutations applied to virtual registers as they propagate through the circuit. These mutations can:

   - Combining virtual register to one,
   - Commute virtual gates across other gate operations,
   - Change basis representation for eg; convert a pauli operator to equivalent U2 gate representation.

The collection nodes are resposible to convert virtual gates to parameter values for template circuits (blue bow tie) or other array valued fields for post-processing (purple bow tie).

As we discussed, the samplex represents a probability distribution and the interface to draw samples from it are `samplex.sample()`. It will return a collection of arrays that will be used during execution of template circuits.


**References**

[1] [Error mitigation and suppression techniques guides](https://quantum.cloud.ibm.com/docs/en/guides/error-mitigation-and-suppression-techniques#pauli-twirling)

[2] [Samplomatic and its use cases | QDC 2025](https://www.youtube.com/watch?v=mZB3SxQMsiI) 

[3] [Dressed boxes guides](https://qiskit.github.io/samplomatic/guides/dressed_boxes.html)