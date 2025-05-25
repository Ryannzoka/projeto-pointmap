let marcadores = new Map();

document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  await carregarGoogleMapsAPI();
  await initMap();
  configurarEventosUI();
}

async function carregarGoogleMapsAPI() {
  ((g) => {
    const p = "The Google Maps JavaScript API",
      c = "google",
      l = "importLibrary",
      q = "__ib__",
      m = document,
      b = window;

    b[c] = b[c] || {};
    const d = b[c].maps || (b[c].maps = {}),
      r = new Set(),
      e = new URLSearchParams(),
      u = () =>
        h ||
        (h = new Promise(async (f, n) => {
          const a = m.createElement("script");
          e.set("libraries", [...r] + "");
          for (const k in g)
            e.set(
              k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
              g[k]
            );
          e.set("callback", c + ".maps." + q);
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
          d[q] = f;
          a.onerror = () => (h = n(Error(p + " could not load.")));
          a.nonce = m.querySelector("script[nonce]")?.nonce || "";
          m.head.append(a);
        }));
    let h;
    d[l]
      ? console.warn(p + " only loads once. Ignoring:", g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({
    key: GOOGLE_MAPS_API_KEY,
    v: "weekly",
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
    const pontos = await response.json();
    pontos.forEach(insertMarker);
  } catch (erro) {
    console.error("Erro ao carregar pontos do banco:", erro);
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
        <div>${ponto.nome}</div>
        <div><i class="fas fa-sticky-note"></i> <strong>Descrição:</strong></div>
        <div>${ponto.descricao}</div>
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

async function abrirModalConsulta() {
  const modal = document.getElementById("modalConsulta");
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch("php/listar_pontos.php");
    const pontos = await res.json();

    if (pontos.length === 0) {
      lista.innerHTML = "<p>Nenhum ponto cadastrado.</p>";
      return;
    }

    lista.innerHTML = "";

    pontos.forEach((ponto) => {
      const item = document.createElement("div");
      item.className = "item-ponto";
      item.innerHTML = `
        <div class="item-info">
          <strong>${ponto.nome}</strong>
        </div>
        <div class="item-botoes">
          <button class="btn-detalhes" title="Ver detalhes" data-nome="${ponto.nome}" data-desc="${ponto.descricao}" data-lat="${ponto.latitude}" data-lng="${ponto.longitude}">
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
                  "Erro ao excluir: " + result.mensagem
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
      showModalMensagem("Erro", "Erro ao cadastrar: " + resultado.mensagem);
    }
  } catch (e) {
    console.error("Erro ao salvar cadastro:", e);
    showModalMensagem("Erro", "Erro inesperado ao cadastrar ponto.");
  }
}
