
In the previous blog, we introduced the concepts of containers and pods. We briefly outlined how to run an application in a pod. Towards the end, we discussed why managing pods directly is tedious. In this blog, we will introduce the workload resources in Kubernetes that manage pods with minimal manual intervention. We will use some quantum computing examples to cover them.

Imagine we want to build an application that performs transpilation [1] of quantum circuits. For a given abstract quantum circuit and a target backend, the application fetches the latest device parameters and converts the circuit into a backend-native ISA circuit. The pods used for this application are independent and do not depend on any previous state. Applications of this type are called **stateless**. For a stateless application, `Deployment` is a natural choice for managing pods.

A `Deployment` treats every pod it manages as interchangeable. All pods share the same pod template. When deploying, we specify the number of replicas (by default 1) we want running. The `Deployment` then creates a `ReplicaSet`, whose purpose is to maintain a stable set of replica pods at any given time. It brings pods up or down to match the specified replica count. This automatic replacement is one of the core self-healing capabilities of Kubernetes — we will cover self-healing in detail in an upcoming blog. Beyond this, a `Deployment` also makes it easier to declare a new state for pods, roll back to an earlier version, and scale up to handle more load [2].

But what if our application needs to remember things between runs? Consider a calibration service for a quantum system. The application needs to keep track of current device parameters, trigger monitoring jobs, continuously check whether parameters drift beyond a threshold, and trigger a calibration run when they do. It must also make current and historical calibration data available on request.

This is where `Deployment` falls short. Since all replicas in a `Deployment` share the same Persistent Volume Claim (PVC), we cannot give each pod its own dedicated storage natively. For our calibration service, we need one pod per device, each with its own independent storage. Applications of this type are called **stateful**, and the appropriate workload resource here is a `StatefulSet`.

A `StatefulSet` shares many characteristics with a `Deployment`. However, each pod in a `StatefulSet` has a persistent identifier, so even though pods are created from the same spec, they are not interchangeable. `StatefulSets` solve the storage problem using Volume Claim Templates [3] — Kubernetes automatically creates a unique PVC for each pod. The persistent identifier then ensures that if a pod fails and is replaced, the new pod reattaches to the same PVC.

In addition to `Deployments` and `StatefulSets`, Kubernetes also supports `DaemonSet`, `Job`, and `CronJob`. A `DaemonSet` runs a pod on every node, or a subset of nodes, acting like a daemon — a background process that runs without user intervention. Common use cases include log collection, node monitoring, and cluster storage. A `Job` defines a task that runs to completion and then stops. A `CronJob` executes a task periodically. Both are typically used for tasks like database migrations, backups, or snapshots. Unlike `Deployments` and `StatefulSets`,`DaemonSets` handle supporting infrastructure work on each node, while `Jobs` and `CronJobs` handle one-off or periodic batch tasks.

So far, we have discussed how a containerised application can be deployed and managed. The next piece of the puzzle is interacting with it. Here again, the ephemeral nature of pods creates a challenge. Every pod is assigned an IP address by default, but this address changes on every restart. To make service discovery robust against pod restarts, Kubernetes provides the `Service` API. We will explore it in the next blog.

References:

[1] [Introduction to Transpilation](https://quantum.cloud.ibm.com/docs/en/guides/transpile#introduction-to-transpilation) 

[2] [Deployment - Use Cases](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#use-case)

[3] [Volume Claim Templates](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#volume-claim-templates)