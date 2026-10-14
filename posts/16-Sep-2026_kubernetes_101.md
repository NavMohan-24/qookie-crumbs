> This blog assumes basic familiarity with Linux and the command line. No prior Kubernetes experience is needed.

Kubernetes is the workhorse of modern cloud computing. It is a container orchestration platform used for scheduling, deploying, and managing containerised applications. A containerised application is a software package that bundles source code along with all its dependencies, libraries, and binaries into a single isolated image. An Image is immutable by design.  Any change in the application code requires rebuilding the image from scratch. They follow the philosophy of *build once, deploy anywhere*.

The physical running instance of an image is called a container. It provides an isolated environment for executing application code. From the perspective of the host device, containers are simply processes. They are isolated from the rest of the processes on the system using Linux namespaces and cgroups. Namespaces control what a container can see. Cgroups control the resources a container can access. There are many resources online covering the different types of Linux namespaces and cgroups. One I particularly recommend is a talk by Liz Rice on creating containers from scratch [1]. It provides a hands-on experience of building containers using namespaces and cgroups. However, the tutorial assumes access to a Linux operating system. You can refer to my notes [2] if you want to follow along using a Linux OS Docker container.

Container runtimes manage the execution of containers. `Containerd` and `CRI-O` are two of the most common container runtimes found in Kubernetes. They do not run containers directly. Instead, they act as a management layer, delegating the task to lower-level runtimes. `runc` and `crun` are popular examples of such lower-level runtimes. They do the heavy lifting — configuring namespaces, cgroups, and security controls — by interacting directly with the operating system kernel.

Kubernetes does not directly deploy and manage containers. Instead, it works with what is known as a **Pod**, which is the smallest unit of compute in a Kubernetes cluster. The pod acts as a logical host for its containers. Kubernetes uses the same Linux namespaces and cgroups to define an isolated environment for the containers within a pod. Kubernetes pods currently support both Linux and Windows operating systems. By default, pods have ephemeral storage. This means all data is tied to the lifecycle of the pod. Any data written to the container's filesystem will be lost if the pod is updated or deleted. To persist data across pod restarts, the container filesystem must be mounted to external storage. Kubernetes handles this through what is known as a **Persistent Volume Claim** [3].

The first step in running an application on a Kubernetes cluster is to build an image from the application logic. Once the image is created, it must be pushed to a container image registry so that it can be discovered by the cluster. Some common image registries are Docker Hub, Elastic Container Registry, and Google Container Registry. The next step is to request Kubernetes to create a pod that runs an instance of the image. Kubernetes will then create the pod according to the given specification and pull the correct image.

The common design pattern is to have a single application container inside a pod. In this case, the pod adds an extra layer of isolation on top of the container. However, a pod can also host more than one container. In cloud-native applications, it is common for a pod to host a *sidecar container* alongside the main application container. In this pattern, the sidecar performs auxiliary tasks that support the main application — for example, handling logging.

Once a pod is set up, the next challenge is running the application reliably without downtime. Pods are designed to be disposable. A pod remains on a node until it completes execution, is deleted, is evicted due to resource constraints, or the node itself fails. This ephemeral nature makes it difficult to run an application reliably using a single independent pod. For instance, once a pod goes down, we have to manually bring up another one, otherwise our application experiences downtime. Further, scaling the application requires managing multiple pods, and doing so manually 
can get tedious. In real production environments, we rarely work with independent pods. Kubernetes provides built-in API objects known as **workload resources** [4] to manage pods on your behalf. In the next blog, we will explore some of these workload resources in action.

**References**

[1] [Containers From Scratch - Liz Rice](https://www.youtube.com/watch?v=8fi7uSYlOdc)

[2] [My Notes](https://github.com/NavMohan-24/Learning-repo/blob/main/learning-containerization/containers-from-scratch/notes.md)

[3] [Persistent Volume Claim](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

[4] [Workload Resources](https://kubernetes.io/docs/concepts/workloads/)
