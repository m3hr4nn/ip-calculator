# IP Subnet Calculator

A simple, static **IP subnet calculator** built with **HTML, CSS, and JavaScript**.  
It calculates network address, broadcast address, usable hosts, and provides a **CIDR-to-Subnet Mask reference table**.

---

## **Features**
- Convert **CIDR to subnet mask** and **wildcard mask**.
- Show **total addresses**, **usable hosts**, and **host range**.
- Includes a **CIDR/Subnet mask table**.
- Stylish red & gray theme via `style.css`.
- Fully static – no backend required.

---

## **Deploy on Local GitLab**
1. Create a new GitLab project.
2. Add `index.html`, `style.css`, and `.gitlab-ci.yml`:
   ```yaml
   pages:
     stage: deploy
     script:
       - mkdir .public
       - cp index.html style.css .public/
     artifacts:
       paths:
         - .public
     only:
       - main
   ```
3. Push the repository:
   ```bash
   git init
   git add index.html style.css .gitlab-ci.yml
   git commit -m "Initial commit"
   git remote add origin <gitlab-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## **Deploy on GitHub Pages**
1. Create a GitHub repository (e.g., `ip-calculator`).
2. Push `index.html` and `style.css`.
3. Go to **Settings > Pages**, select **main branch**, and your site will be available at:  
   `https://<your-username>.github.io/ip-calculator/`

---

## **Local Preview**
Open `index.html` in a browser to preview.

---
