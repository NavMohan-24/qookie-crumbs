

Kubernetes is the workhorse of modern cloud computing. It is a container orchestration platform used for scheduling, deploying, and managing containerised applications. A containerised application is a software package that bundles source code along with all its dependencies, libraries, and binaries into a single isolated image. Images are immutable by design. They follow the philosophy of build once, deploy anywhere. Any change in the application code requires rebuilding the image from scratch.

The physical running instance of an image is called a container. It provides an isolated environment for executing application code. From the perspective of the host device, containers are simply processes. They are isolated from the rest of the processes on the system using Linux namespaces and cgroups. Namespaces control what a container can see. Cgroups control the resources a container can access. There are many resources online covering the different types of Linux namespaces and cgroups. One I particularly recommend is a talk by Liz Rice on creating containers from scratch [1]. It provides a hands-on experience of building containers using namespaces and cgroups. However, the tutorial assumes access to a Linux operating system. You can refer to my notes if you want to follow along using a Linux OS Docker container [2].

Container runtimes manage the execution of containers. Containerd and CRI-O are two of the most common container runtimes found in Kubernetes. They do not run containers directly. Instead, they act as a management layer, delegating the task to lower-level runtimes. runc and crun are popular examples of such lower-level runtimes. They do the heavy lifting such as configuring namespaces, cgroups, and security controls by interacting directly with the operating system kernel.

Kubernetes does not directly deploy and manage containers. Instead, it works with what is known as a Pod, which is the smallest unit of compute in a Kubernetes cluster. The common design pattern is to have a single application container inside a pod. In this case, the pod adds an extra layer of isolation on top of the container. However, a pod can also host more than one container. In cloud-native applications, it is common for a pod to host a sidecar container alongside the main application container. In this pattern, the sidecar performs auxiliary tasks that support the main application — for example, handling logging.

The pod acts as a logical host for its containers. Kubernetes uses the same Linux namespaces and cgroups to define an isolated environment for the containers within a pod. Kubernetes pods currently support both Linux and Windows operating systems.

By default, pods use ephemeral storage. This means all data is tied to the lifecycle of the pod. Any data written to the container's filesystem will be lost if the pod is updated or deleted. To persist data across pod restarts, the container filesystem must be mounted to external storage. Kubernetes handles this through what is known as a Persistent Volume Claim.

So far, we have seen the containers, runtimes, and pods which are the key building blocks of Kubernetes. But how does Kubernetes manage all of these at scale? There must be some underlying architecture that keeps everything running smoothly. In the next blog, we will look at the architecture of a Kubernetes cluster and set one up locally using kind (Kubernetes in Docker).

**References**

[1] [Containers From Scratch - Liz Rice](https://www.youtube.com/watch?v=8fi7uSYlOdc)
[2] [My Notes](https://github.com/NavMohan-24/Learning-repo/blob/main/learning-containerization/containers-from-scratch/notes.md)