# Directing the execution of randomization experiments


Qiskit has introduced a new Directed Execution Model [1] that provides user's the highest flexibility in designing quantum circuits, defining their randomisations, and executing them on real quantum hardware. In the previous blogs, we saw how Samplomatic builds a procedural representation of a randomization experiment. In this blog, we will look at how to execute it on a quantum computer. 

The conventional primivites in Qiskit (`EstimatorV2` and `SamplerV2`) accepts what are called PUBs (Primitive Unified Blocs). A PUB is composed of a quantum circuit, parameters and observables (for an estimator). These primitives are not designed to accept a samplex or execute a template circuit using the parameters it outputs. To address this, Qiskit has introduced a new quantum runtime executable called `QuantumProgram` and a new primitive called `Executor`.

The idea of a `QuantumProgram` could be easily understood if we draw parallels between the `Executor` with conventional primitives. Just as PUBs are the inputs to conventional primitives, QuantumProgram is the input to the `Executor`. More precisely, a QuantumProgram is an iterable of QuantumProgramItems, which come in two types:

- `CircuitItem` : Stores Circuits and its Parameters (if any).
- `SamplexItem` : Stores a template_circuit, a Samplex object and arguments for the Samplex. 

During execution, a `CircuitItem` is executed without any randomisation. A `SamplexItem`, on the other hand, is used to perform randomisations. A `QuantumProgram` can be initialised and populated as follows:

```python
from qiskit_ibm_runtime.quantum_program import QuantumProgram

program = QuantumProgram(shots=100)

# append circuit item into the program
program.append_circuit_item(circuit=circuit, circuit_arguments=parameter_values)

# append samplex item into the program
program.append_samplex_item(circuit=circuit, samplex = samplex, samplex_arguments=parameter_values, shape=(10,20)) # 10 randomization * 20 parameter sets
```

Once a `QuantumProgram` is constructed, it can be executed via the `Executor` primitive as follows. 
```python
from qiskit_ibm_runtime.executor import Executor

executor = Executor(mode=backend)
job = executor.run(program)
res = job.result()[0]
```

The interface is very similar to `EstimatorV2` and `SamplerV2`.

### Executing twirled Bell circuit example using Executor.

<!-- Let's look into how a `QuantumProgram` and `Executor` could be used to perform the twirling on bell-circuit experiment.  -->
In the previous of blog, we discussed two approaches to have an abstract representation of a randomisation experiment. The first approach involves manually grouping logical operations into boxes and annotating them. However, this is prone to errors from inconsistent dressing. The second approach uses the boxing pass manager, which constructs boxed circuits with proper annotations automatically during transpilation. Either way, once the abstract representation is ready, the `build()` method converts it into a procedural representation. We now build on this and look at how to create a `QuantumProgram` and execute it using the `Executor`.


<!-- go back to the example of twirling a Bell circuit. In the previous blogs, we have discussed about designing a randomization experiment using Samplomatic. First, we looked in to manually grouping the operations using box operations and annotating them. Then, we looked into how boxing pass manager could be used to construct the boxed up circuit with annotations. Once we have a abstract representation of the randomization, using the `build` method in Samplomatic we could convert it into a procedural representation.  -->

<!-- The build method outputs template circuit and Samplex. The template circuit is a parameterized quantum circuit that would be executed in place of the original circuit and the samplex would governs the randomization by supplying parameters to the template circuit. However, in the earlier section we saw that executing template circuit along with samplex would require construction of `QuantumProgram`. The quantum program could be accepted by the new Executor primitive and executed in the real quantum computer.  -->


```python
from samplomatic.transpiler import generate_boxing_pass_manager
from qiskit.circuit import QuantumCircuit
from samplomatic import Twirl, build
from qiskit_ibm_runtime.quantum_program import QuantumProgram
from qiskit_ibm_runtime.executor import Executor

# Bell circuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cz(0, 1)
qc.measure(range(2), range(2))

# Define the pass manager for twirling gates and measures
boxing_pass_manager = generate_boxing_pass_manager(
    enable_gates=True,
    enable_measures=True,
)

tqc = boxing_pass_manager.run(qc)

# Build the template circuit and samplex
template_circuit, samplex = build(tqc)

# Define the quantum program and add a SamplexItem
program = QuantumProgram(shots=1024)
program.append_samplex_item(
    circuit=template_circuit,
    samplex=samplex,
    samplex_arguments={},
    shape=(10,)  # 10 randomisations
)

# Initialise the executor
executor = Executor(mode=backend)

# Execute the QuantumProgram
job = executor.run(program)
res = job.result()[0]

# Post-processing
res_1 = res['c']                      # raw results
# print(res_1.shape)                  # (10, 1024, 2)

flips_1 = res['measurement_flips.c'] # measurement bit flips
# print(flips_1.shape)                # (10, 1, 2)

# Correct raw results via XOR
unflipped_result_1 = res_1 ^ flips_1
# print(unflipped_result_1.shape)     # (10, 1024, 2)
```
The result is returned as a dictionary. The output from the twirling experiment could be accessed via classical register name as key. The shape of the output array would be `(num_randomisations, num_shots, num_creg)`. 

However, this output alone is not entirely sufficient. Since we are performing measurement twirling, some gates are propagated to the end of the circuit. These need to be corrected to undo the effect of twirling. The required bit flips can be accessed via the key `measurement_flips.{creg_name}`. The shape of the bit flip array is `(num_randomisations, 1, num_register)`. The middle dimension is always 1, since the bit flip to be applied remains constant per randomisation.

Once we have both arrays, we apply a classical bitwise XOR to correct the results [2]. Note that this XOR operation follows NumPy's broadcasting rules.

**References**

[1] [Directed Execution Model](https://quantum.cloud.ibm.com/docs/en/guides/directed-execution-model)

[2] [Executor Input Output](https://quantum.cloud.ibm.com/docs/en/guides/executor-input-output)

