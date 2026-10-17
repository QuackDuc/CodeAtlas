/**
 * app.js - Application Controller & Interactive SVG Engines
 * CodeAtlas 4-Screen UI/UX Prototype
 * Screens: 1. Login | 2. Dashboard | 3. Codebase Map | 4. AI Assistant
 */

class CodeAtlasApp {
  constructor() {
    this.currentScreen = "login";
    this.selectedMapNode = "AuthService";
    
    // Map Viewport transform
    this.mapZoom = 1;
    this.mapPan = { x: 40, y: 30 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderDashboardGraph();
    this.initCodebaseMap();
  }

  /* --------------------------------------------------------------------------
     Navigation & Screen State Management
     -------------------------------------------------------------------------- */
  navigateTo(screenId) {
    if (this.currentScreen === screenId) return;

    // Handle logout or login screen transitions
    const loginScreen = document.getElementById("screen-login");
    const appShell = document.getElementById("app-shell");

    if (screenId === "login") {
      this.currentScreen = "login";
      loginScreen.style.display = "flex";
      appShell.style.display = "none";
      return;
    }

    // Entering the app shell (Screens 2, 3, 4)
    loginScreen.style.display = "none";
    appShell.style.display = "flex";

    // Toggle active screen views
    document.querySelectorAll(".screen-view").forEach(el => {
      el.classList.remove("active");
    });
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
      targetScreen.classList.add("active");
    }

    // Update active sidebar nav items
    document.querySelectorAll(".sidebar .nav-item").forEach(item => {
      item.classList.remove("active");
      if (item.dataset.screen === screenId) {
        item.classList.add("active");
      }
    });

    this.currentScreen = screenId;

    // Screen specific triggers
    if (screenId === "map") {
      // Refresh transform if container was resized
      setTimeout(() => this.updateMapTransform(), 50);
    }
  }

  bindEvents() {
    // Login form submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.navigateTo("dashboard");
      });
    }

    // AI message form submission
    const aiForm = document.getElementById("ai-chat-form");
    if (aiForm) {
      aiForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserChatMessage();
      });
    }
  }

  /* --------------------------------------------------------------------------
     SCREEN 2: Dashboard Overview Graph (SVG)
     -------------------------------------------------------------------------- */
  renderDashboardGraph() {
    const container = document.getElementById("dashboard-graph-canvas");
    if (!container) return;
    container.innerHTML = "";

    const { nodes, edges } = CODEATLAS_MOCK.dashboardGraph;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1020 330");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";

    // Defs for arrows and grid
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="dash-arrow" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B4866" />
      </marker>
      <marker id="dash-arrow-active" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4F8CFF" />
      </marker>
      <pattern id="dash-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#172033" />
      </pattern>
    `;
    svg.appendChild(defs);

    // Background Grid
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "url(#dash-grid)");
    svg.appendChild(bg);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw Edges
    const edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    edges.forEach((edge, i) => {
      const u = nodeMap.get(edge.from);
      const v = nodeMap.get(edge.to);
      if (!u || !v) return;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("id", `dash-edge-${i}`);
      path.setAttribute("class", `dash-edge edge-from-${u.id.replace('.', '_')} edge-to-${v.id.replace('.', '_')}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#253047");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("marker-end", "url(#dash-arrow)");

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const d = `M ${u.x} ${u.y} C ${u.x + dx * 0.5} ${u.y}, ${u.x + dx * 0.5} ${v.y}, ${v.x} ${v.y}`;
      path.setAttribute("d", d);

      edgesGroup.appendChild(path);

      // Label on edge
      if (edge.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (u.x + v.x) / 2);
        text.setAttribute("y", (u.y + v.y) / 2 - 6);
        text.setAttribute("fill", "#64748B");
        text.setAttribute("font-size", "10");
        text.setAttribute("font-family", "JetBrains Mono, monospace");
        text.setAttribute("text-anchor", "middle");
        text.textContent = edge.label;
        edgesGroup.appendChild(text);
      }
    });
    svg.appendChild(edgesGroup);

    // Draw Nodes
    const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodes.forEach(node => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      g.style.cursor = "pointer";

      const cardWidth = 145;
      const cardHeight = 44;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", -cardWidth / 2);
      rect.setAttribute("y", -cardHeight / 2);
      rect.setAttribute("width", cardWidth);
      rect.setAttribute("height", cardHeight);
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", "#111827");
      rect.setAttribute("stroke", "#253047");
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("class", "dash-node-box");

      // Left Accent Pill
      const pill = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      pill.setAttribute("x", -cardWidth / 2 + 8);
      pill.setAttribute("y", -10);
      pill.setAttribute("width", 3.5);
      pill.setAttribute("height", 20);
      pill.setAttribute("rx", "1.75");
      pill.setAttribute("fill", node.type === "entry" ? "#38BDF8" : (node.type === "database" ? "#4F8CFF" : "#A855F7"));

      const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
      title.setAttribute("x", -cardWidth / 2 + 18);
      title.setAttribute("y", -2);
      title.setAttribute("fill", "#F1F5F9");
      title.setAttribute("font-size", "12");
      title.setAttribute("font-family", "JetBrains Mono, monospace");
      title.setAttribute("font-weight", "600");
      title.textContent = node.label;

      const role = document.createElementNS("http://www.w3.org/2000/svg", "text");
      role.setAttribute("x", -cardWidth / 2 + 18);
      role.setAttribute("y", 12);
      role.setAttribute("fill", "#94A3B8");
      role.setAttribute("font-size", "9.5");
      role.setAttribute("font-family", "Inter, sans-serif");
      role.textContent = node.role;

      g.appendChild(rect);
      g.appendChild(pill);
      g.appendChild(title);
      g.appendChild(role);

      // Hover Effects
      g.addEventListener("mouseenter", () => {
        rect.setAttribute("stroke", "#4F8CFF");
        rect.setAttribute("fill", "#172033");
        const conn = svg.querySelectorAll(`.edge-from-${node.id.replace('.', '_')}, .edge-to-${node.id.replace('.', '_')}`);
        conn.forEach(edgeEl => {
          edgeEl.setAttribute("stroke", "#4F8CFF");
          edgeEl.setAttribute("stroke-width", "2");
          edgeEl.setAttribute("marker-end", "url(#dash-arrow-active)");
        });
      });

      g.addEventListener("mouseleave", () => {
        rect.setAttribute("stroke", "#253047");
        rect.setAttribute("fill", "#111827");
        const conn = svg.querySelectorAll(`.edge-from-${node.id.replace('.', '_')}, .edge-to-${node.id.replace('.', '_')}`);
        conn.forEach(edgeEl => {
          edgeEl.setAttribute("stroke", "#253047");
          edgeEl.setAttribute("stroke-width", "1.5");
          edgeEl.setAttribute("marker-end", "url(#dash-arrow)");
        });
      });

      // Click opens the Codebase Map directly on this node
      g.addEventListener("click", () => {
        this.selectedMapNode = node.id;
        this.navigateTo("map");
        this.selectMapNode(node.id);
      });

      nodesGroup.appendChild(g);
    });
    svg.appendChild(nodesGroup);

    container.appendChild(svg);
  }

  /* --------------------------------------------------------------------------
     SCREEN 3: Codebase Map (Interactive SVG Engine)
     -------------------------------------------------------------------------- */
  initCodebaseMap() {
    const container = document.getElementById("map-canvas-container");
    if (!container) return;
    container.innerHTML = "";

    this.mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.mapSvg.setAttribute("width", "100%");
    this.mapSvg.setAttribute("height", "100%");
    this.mapSvg.style.cursor = "grab";
    this.mapSvg.style.display = "block";

    // Defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="map-arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B4866" />
      </marker>
      <marker id="map-arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4F8CFF" />
      </marker>
      <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#162035" stroke-width="0.75" stroke-dasharray="2,3"/>
      </pattern>
    `;
    this.mapSvg.appendChild(defs);

    // Background
    this.mapBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.mapBg.setAttribute("width", "100%");
    this.mapBg.setAttribute("height", "100%");
    this.mapBg.setAttribute("fill", "url(#map-grid)");
    this.mapSvg.appendChild(this.mapBg);

    // Zoom/Pan root group
    this.mapRootGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mapSvg.appendChild(this.mapRootGroup);

    this.mapEdgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mapRootGroup.appendChild(this.mapEdgesGroup);

    this.mapNodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mapRootGroup.appendChild(this.mapNodesGroup);

    container.appendChild(this.mapSvg);

    // Bind Map Pan/Zoom Mouse Events
    this.bindMapInteractions(container);

    // Render nodes & edges
    this.renderMap();
    this.updateMapTransform();

    // Select initial node (AuthService)
    this.selectMapNode(this.selectedMapNode);
  }

  bindMapInteractions(container) {
    this.mapSvg.addEventListener("mousedown", (e) => {
      if (e.target === this.mapSvg || e.target === this.mapBg || e.target.classList.contains("map-edge")) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.mapPan.x, y: e.clientY - this.mapPan.y };
        this.mapSvg.style.cursor = "grabbing";
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isPanning) {
        this.mapPan.x = e.clientX - this.panStart.x;
        this.mapPan.y = e.clientY - this.panStart.y;
        this.updateMapTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.mapSvg.style.cursor = "grab";
      }
    });

    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY < 0 ? 1.12 : 0.88;
      const newZoom = Math.min(Math.max(this.mapZoom * delta, 0.4), 2.2);

      if (newZoom !== this.mapZoom) {
        this.mapPan.x = mouseX - (mouseX - this.mapPan.x) * (newZoom / this.mapZoom);
        this.mapPan.y = mouseY - (mouseY - this.mapPan.y) * (newZoom / this.mapZoom);
        this.mapZoom = newZoom;
        this.updateMapTransform();
      }
    }, { passive: false });
  }

  updateMapTransform() {
    if (!this.mapRootGroup) return;
    this.mapRootGroup.setAttribute(
      "transform",
      `translate(${this.mapPan.x}, ${this.mapPan.y}) scale(${this.mapZoom})`
    );
  }

  zoomMap(delta) {
    const newZoom = Math.min(Math.max(this.mapZoom * delta, 0.4), 2.2);
    this.mapZoom = newZoom;
    this.updateMapTransform();
  }

  resetMapView() {
    this.mapZoom = 1;
    this.mapPan = { x: 40, y: 30 };
    this.updateMapTransform();
  }

  renderMap() {
    const { nodes, edges } = CODEATLAS_MOCK.codebaseMap;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw Edges
    this.mapEdgesGroup.innerHTML = "";
    edges.forEach((edge, i) => {
      const u = nodeMap.get(edge.from);
      const v = nodeMap.get(edge.to);
      if (!u || !v) return;

      const isConnected = this.selectedMapNode === edge.from || this.selectedMapNode === edge.to;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("id", `map-edge-${i}`);
      path.setAttribute("class", `map-edge ${isConnected ? 'active' : ''}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", isConnected ? "#4F8CFF" : "#253047");
      path.setAttribute("stroke-width", isConnected ? "2" : "1.2");
      path.setAttribute("marker-end", isConnected ? "url(#map-arrow-active)" : "url(#map-arrow)");

      const dx = v.x - u.x;
      const d = `M ${u.x} ${u.y} C ${u.x + dx * 0.5} ${u.y}, ${u.x + dx * 0.5} ${v.y}, ${v.x} ${v.y}`;
      path.setAttribute("d", d);
      this.mapEdgesGroup.appendChild(path);

      if (isConnected && edge.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (u.x + v.x) / 2);
        text.setAttribute("y", (u.y + v.y) / 2 - 6);
        text.setAttribute("fill", "#8B9BB4");
        text.setAttribute("font-size", "10");
        text.setAttribute("font-family", "JetBrains Mono, monospace");
        text.setAttribute("text-anchor", "middle");
        text.textContent = edge.label;
        this.mapEdgesGroup.appendChild(text);
      }
    });

    // Draw Nodes
    this.mapNodesGroup.innerHTML = "";
    nodes.forEach(node => {
      const isSelected = this.selectedMapNode === node.id;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("id", `map-node-${node.id}`);
      g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      g.style.cursor = "pointer";

      const cardWidth = Math.max(140, node.label.length * 8.5 + 46);
      const cardHeight = 44;

      // Outer Selection Ring
      if (isSelected) {
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        ring.setAttribute("x", -cardWidth / 2 - 3);
        ring.setAttribute("y", -cardHeight / 2 - 3);
        ring.setAttribute("width", cardWidth + 6);
        ring.setAttribute("height", cardHeight + 6);
        ring.setAttribute("rx", "9");
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#4F8CFF");
        ring.setAttribute("stroke-width", "1.5");
        ring.setAttribute("stroke-opacity", "0.7");
        g.appendChild(ring);
      }

      // Card Body
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", -cardWidth / 2);
      rect.setAttribute("y", -cardHeight / 2);
      rect.setAttribute("width", cardWidth);
      rect.setAttribute("height", cardHeight);
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", isSelected ? "#172033" : "#111827");
      rect.setAttribute("stroke", isSelected ? "#4F8CFF" : "#253047");
      rect.setAttribute("stroke-width", isSelected ? "1.5" : "1");
      g.appendChild(rect);

      // Left Color Dot / Pill
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      dot.setAttribute("x", -cardWidth / 2 + 10);
      dot.setAttribute("y", -9);
      dot.setAttribute("width", 3.5);
      dot.setAttribute("height", 18);
      dot.setAttribute("rx", "1.75");
      dot.setAttribute("fill", node.color);
      g.appendChild(dot);

      // Label
      const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
      title.setAttribute("x", -cardWidth / 2 + 20);
      title.setAttribute("y", -1);
      title.setAttribute("fill", isSelected ? "#FFFFFF" : "#F1F5F9");
      title.setAttribute("font-size", "12");
      title.setAttribute("font-family", "JetBrains Mono, monospace");
      title.setAttribute("font-weight", isSelected ? "600" : "500");
      title.textContent = node.label;
      g.appendChild(title);

      // Sub-badge / Role
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badge.setAttribute("x", -cardWidth / 2 + 20);
      badge.setAttribute("y", 12);
      badge.setAttribute("fill", "#64748B");
      badge.setAttribute("font-size", "9.5");
      badge.setAttribute("font-family", "Inter, sans-serif");
      badge.textContent = `${node.type} • ${node.badge}`;
      g.appendChild(badge);

      // Node Event
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectMapNode(node.id);
      });

      this.mapNodesGroup.appendChild(g);
    });
  }

  selectMapNode(nodeId) {
    this.selectedMapNode = nodeId;
    this.renderMap();

    const node = CODEATLAS_MOCK.codebaseMap.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Update Right Inspector Panel
    const inspector = document.getElementById("map-inspector-container");
    if (!inspector) return;

    const details = node.details;

    inspector.innerHTML = `
      <div class="inspector-header">
        <div>
          <div style="font-size: 15px; font-weight: 600; font-family: var(--font-mono); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 2px; background: ${node.color}; display: inline-block;"></span>
            ${node.label}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${details.type} in <span class="font-mono" style="color: var(--text-secondary);">${details.file}</span>
          </div>
        </div>
        <span class="tag-badge font-mono">${details.module}</span>
      </div>

      <div class="inspector-content">
        <!-- Description -->
        <div class="inspector-section">
          <div class="section-label">Summary</div>
          <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
            ${details.description}
          </div>
        </div>

        <!-- Functions -->
        <div class="inspector-section">
          <div class="section-label">Functions (${details.functions.length})</div>
          <div class="token-list">
            ${details.functions.map(fn => `
              <div class="token-item">
                <span style="color: #A855F7;">def</span> ${fn}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dependencies -->
        <div class="inspector-section">
          <div class="section-label">Dependencies (${details.dependencies.length})</div>
          <div class="token-pill-wrap">
            ${details.dependencies.length > 0 
              ? details.dependencies.map(dep => `
                  <span class="token-pill" style="cursor: pointer;" onclick="app.selectMapNode('${dep}')">
                    ${dep}
                  </span>
                `).join('')
              : '<span style="font-size: 12px; color: var(--text-muted);">None</span>'
            }
          </div>
        </div>

        <!-- Used By -->
        <div class="inspector-section">
          <div class="section-label">Used By (${details.usedBy.length})</div>
          <div class="token-pill-wrap">
            ${details.usedBy.length > 0 
              ? details.usedBy.map(ub => `
                  <span class="token-pill" style="cursor: pointer;" onclick="app.selectMapNode('${ub}')">
                    ${ub}
                  </span>
                `).join('')
              : '<span style="font-size: 12px; color: var(--text-muted);">None</span>'
            }
          </div>
        </div>

        <!-- Quick AI action -->
        <div style="margin-top: 10px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
          <button class="btn btn-outline-ai btn-sm" style="width: 100%;" onclick="app.askAIAbout('${node.label}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            Ask AI about ${node.label}
          </button>
        </div>
      </div>
    `;
  }

  askAIAbout(componentName) {
    this.navigateTo("ai");
    this.simulateAIQuery(`Explain ${componentName} and its role in the codebase.`);
  }

  /* --------------------------------------------------------------------------
     SCREEN 4: AI Assistant (Suggested QA & Mock Interactions)
     -------------------------------------------------------------------------- */
  askSuggestedQuestion(index) {
    const qa = CODEATLAS_MOCK.aiQA[index];
    if (!qa) return;

    this.renderAIMessagePair(qa.question, qa.answer, qa.referencedFiles);
  }

  handleUserChatMessage() {
    const input = document.getElementById("ai-user-input");
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    input.value = "";
    this.simulateAIQuery(query);
  }

  simulateAIQuery(queryText) {
    // Check if query matches any known suggested presets
    const lower = queryText.toLowerCase();
    let matchedQA = CODEATLAS_MOCK.aiQA.find(qa => 
      lower.includes("authentication") || lower.includes("auth")
    );

    if (lower.includes("database") || lower.includes("depend on database")) {
      matchedQA = CODEATLAS_MOCK.aiQA[1];
    } else if (lower.includes("registration") || lower.includes("register")) {
      matchedQA = CODEATLAS_MOCK.aiQA[2];
    } else if (lower.includes("authservice") || lower.includes("auth_service")) {
      matchedQA = CODEATLAS_MOCK.aiQA[0];
    }

    if (!matchedQA) {
      matchedQA = {
        question: queryText,
        answer: `CodeAtlas analyzed the repository components. "${queryText}" involves the coordination between AuthService, UserRepository, and Database as mapped in the dependency graph.`,
        referencedFiles: [
          { name: "auth_service.py", path: "src/auth/auth_service.py" },
          { name: "database.py", path: "src/database/database.py" }
        ]
      };
    }

    this.renderAIMessagePair(queryText, matchedQA.answer, matchedQA.referencedFiles);
  }

  renderAIMessagePair(question, answer, referencedFiles = []) {
    const thread = document.getElementById("ai-chat-thread");
    if (!thread) return;

    // User Message element
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user-msg";
    userMsg.innerHTML = `
      <div class="chat-avatar user">U</div>
      <div class="chat-body">${question}</div>
    `;
    thread.appendChild(userMsg);

    // AI Message element with referenced files
    const aiMsg = document.createElement("div");
    aiMsg.className = "chat-message ai-msg";
    aiMsg.innerHTML = `
      <div class="chat-avatar ai">AI</div>
      <div class="chat-body">
        <div>${answer}</div>
        ${referencedFiles && referencedFiles.length > 0 ? `
          <div class="referenced-files-box">
            <div class="referenced-title">Referenced files:</div>
            <div class="referenced-files-list">
              ${referencedFiles.map(file => `
                <span class="ref-file-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  ${file.name}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    thread.appendChild(aiMsg);

    // Scroll to bottom smoothly
    thread.scrollTop = thread.scrollHeight;
  }
}

// Global instance for inline onclick handlers
let app;
window.addEventListener("DOMContentLoaded", () => {
  app = new CodeAtlasApp();
});
