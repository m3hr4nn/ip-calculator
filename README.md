# IP Subnet Calculator

A simple, static **IP subnet calculator** built with **HTML, CSS, and JavaScript**.  
It calculates network address, broadcast address, usable hosts, and more based on an IP and CIDR.

---

## **Features**
- Convert **CIDR to subnet mask** and **wildcard mask**.
- Show **total addresses**, **usable hosts**, and **host range**.
- Fully static – no backend required.

---

## **How to Deploy on Local GitLab**
1. Create a new project on your GitLab instance.
2. Add `index.html` and `.gitlab-ci.yml` (example below) to the repository root:
   ```yaml
   pages:
     stage: deploy
     script:
       - mkdir .public
       - cp index.html .public/
     artifacts:
       paths:
         - .public
     only:
       - main
