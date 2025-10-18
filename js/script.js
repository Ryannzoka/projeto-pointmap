let marcadores = new Map();

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  // MUDANÇA: Agora carrega do servidor PHP (chave protegida)
  await carregarGoogleMapsAPI();
  await initMap();
  configurarEventosUI();
}

/**
 * Carrega o script do Google Maps de forma segura
 * A API key agora vem do servidor PHP
 */
async function carregarGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'php/get_maps_script.php'; // ← MUDANÇA AQUI
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API carregada com sucesso');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Erro ao carregar Google Maps API');
      reject(new Error('Falha ao carregar Google Maps'));
    };
    
    document.head.appendChild(script);
  });
}

async function initMap() {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  window.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -28.48279058786053, lng: -49.00887802637711 },
    zoom: 13,
    mapId: "DEMO_MAP_ID",
    disableDefaultUI: true,
  });

  map.addListener("click", (event) => {
    onMapaClick(event.latLng.lat(), event.latLng.lng());
  });

  try {
    const response = await fetch("php/listar_pontos.php");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pontos = await response.json();
    pontos.forEach(insertMarker);
  } catch (erro) {
    console.error("Erro ao carregar pontos do banco:", erro);
    showModalMensagem("Erro", "Não foi possível carregar os pontos cadastrados.");
  }
}

function configurarEventosUI() {
  document
    .querySelector(".btn-consultar")
    .addEventListener("click", abrirModalConsulta);
  document
    .getElementById("fecharModalConsulta")
    .addEventListener("click", () => fecharModal("modalConsulta"));
  document
    .getElementById("fecharModalDetalhes")
    .addEventListener("click", () => fecharModal("modalDetalhes"));
  document
    .getElementById("fecharModal")
    .addEventListener("click", () => fecharModal("modalCadastro"));
  document
    .getElementById("formCadastro")
    .addEventListener("submit", salvarCadastro);
  document
    .getElementById("fecharModalMensagem")
    .addEventListener("click", () => fecharModal("modalMensagem"));
}

function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function fecharModal(id) {
  document.getElementById(id).style.display = "none";
}

function abrirModalConfirmacao(titulo, mensagem, onConfirmar) {
  const modal = document.getElementById("modalConfirmacao");
  const tituloEl = document.getElementById("modalConfirmacaoTitulo");
  const mensagemEl = document.getElementById("modalConfirmacaoTexto");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const btnCancelar = document.getElementById("btnCancelar");

  tituloEl.textContent = titulo;
  mensagemEl.innerHTML = mensagem;

  const novoBtnConfirmar = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtnConfirmar, btnConfirmar);

  novoBtnConfirmar.addEventListener("click", () => {
    fecharModal("modalConfirmacao");
    onConfirmar();
  });

  btnCancelar.addEventListener("click", () => {
    fecharModal("modalConfirmacao");
  });

  abrirModal("modalConfirmacao");
}

function onMapaClick(lat, lng) {
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lng;
  abrirModal("modalCadastro");
}

function showModalMensagem(titulo, mensagem) {
  document.getElementById("modalMensagemTitulo").innerText = titulo;
  document.getElementById("modalMensagemTexto").innerHTML = mensagem;
  abrirModal("modalMensagem");
}

async function insertMarker(ponto) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const img = document.createElement("img");
  img.src = "assets/img/pin.png";
  img.style.width = "35px";
  img.style.height = "35px";
  img.style.transform = "translate(-50%, -100%)";
  img.style.position = "absolute";

  const marker = new AdvancedMarkerElement({
    map,
    position: {
      lat: parseFloat(ponto.latitude),
      lng: parseFloat(ponto.longitude),
    },
    content: img,
    title: `${ponto.nome} - ${ponto.descricao}`,
  });

  marker.addListener("gmp-click", () => {
    const texto = `
      <div class="detalhes-grid">
        <div><i class="fas fa-map-marker-alt"></i> <strong>Nome:</strong></div>
        <div>${escapeHtml(ponto.nome)}</div>
        <div><i class="fas fa-sticky-note"></i> <strong>Descrição:</strong></div>
        <div>${escapeHtml(ponto.descricao)}</div>
        <div><i class="fas fa-globe-americas"></i> <strong>Coordenadas:</strong></div>
        <div>${ponto.latitude}, ${ponto.longitude}</div>
      </div>
    `;

    map.setCenter({
      lat: parseFloat(ponto.latitude),
      lng: parseFloat(ponto.longitude),
    });
    map.setZoom(16);
    img.classList.add("destacar-marker");
    setTimeout(() => img.classList.remove("destacar-marker"), 1500);

    document.getElementById("detalhesTexto").innerHTML = texto;
    abrirModal("modalDetalhes");
  });

  marcadores.set(Number(ponto.id), marker);
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

async function abrirModalConsulta() {
  const modal = document.getElementById("modalConsulta");
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch("php/listar_pontos.php");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const pontos = await res.json();

    if (pontos.length === 0) {
      lista.innerHTML = "<p>Nenhum ponto cadastrado.</p>";
      abrirModal("modalConsulta");
      return;
    }

    lista.innerHTML = "";

    pontos.forEach((ponto) => {
      const item = document.createElement("div");
      item.className = "item-ponto";
      item.innerHTML = `
        <div class="item-info">
          <strong>${escapeHtml(ponto.nome)}</strong>
        </div>
        <div class="item-botoes">
          <button class="btn-detalhes" title="Ver detalhes" data-nome="${escapeHtml(ponto.nome)}" data-desc="${escapeHtml(ponto.descricao)}" data-lat="${ponto.latitude}" data-lng="${ponto.longitude}">
            <i class="fas fa-info-circle"></i>
          </button>
          <button class="btn-ver" title="Ver no mapa" data-lat="${ponto.latitude}" data-lng="${ponto.longitude}">
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button class="btn-excluir" title="Excluir ponto" data-id="${ponto.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      lista.appendChild(item);
    });

    lista.querySelectorAll(".btn-ver").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        map.setCenter({ lat, lng });
        map.setZoom(16);
        fecharModal("modalConsulta");
      });
    });

    lista.querySelectorAll(".btn-excluir").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        abrirModalConfirmacao(
          "Excluir ponto",
          "Tem certeza que deseja excluir este ponto?",
          async () => {
            try {
              const res = await fetch("php/excluir_ponto.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `id=${encodeURIComponent(id)}`,
              });
              
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              
              const result = await res.json();
              
              if (result.status === "sucesso") {
                showModalMensagem("Sucesso", "Ponto excluído com sucesso.");
                btn.closest(".item-ponto").remove();

                const marker = marcadores.get(Number(id));
                if (marker) {
                  marker.setMap(null);
                  marcadores.delete(Number(id));
                }
              } else {
                showModalMensagem(
                  "Erro",
                  "Erro ao excluir: " + escapeHtml(result.mensagem)
                );
              }
            } catch (e) {
              console.error("Erro ao excluir ponto:", e);
              showModalMensagem("Erro", "Erro inesperado ao excluir ponto.");
            }
          }
        );
      });
    });

    lista.querySelectorAll(".btn-detalhes").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nome = btn.dataset.nome;
        const descricao = btn.dataset.desc;
        const latitude = btn.dataset.lat;
        const longitude = btn.dataset.lng;

        const texto = `
          <div class="detalhes-grid">
            <div><i class="fas fa-map-marker-alt"></i> <strong>Nome:</strong></div>
            <div>${nome}</div>
            <div><i class="fas fa-sticky-note"></i> <strong>Descrição:</strong></div>
            <div>${descricao}</div>
            <div><i class="fas fa-globe-americas"></i> <strong>Coordenadas:</strong></div>
            <div>${latitude}, ${longitude}</div>
          </div>
        `;

        document.getElementById("detalhesTexto").innerHTML = texto;
        abrirModal("modalDetalhes");
      });
    });

    abrirModal("modalConsulta");
  } catch (e) {
    lista.innerHTML = "<p>Erro ao carregar dados.</p>";
    console.error(e);
  }
}

async function salvarCadastro(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("php/salvar_ponto.php", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const resultado = await response.json();

    if (resultado.status === "sucesso") {
      const ponto = {
        id: resultado.id,
        nome: formData.get("nome"),
        descricao: formData.get("descricao"),
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
      };
      await insertMarker(ponto);
      showModalMensagem("Sucesso", "Ponto cadastrado com sucesso!");
      fecharModal("modalCadastro");
      form.reset();
    } else {
      showModalMensagem("Erro", "Erro ao cadastrar: " + escapeHtml(resultado.mensagem));
    }
  } catch (e) {
    console.error("Erro ao salvar cadastro:", e);
    showModalMensagem("Erro", "Erro inesperado ao cadastrar ponto.");
  }
}