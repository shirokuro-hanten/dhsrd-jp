// ページ読み込み時の動作
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initReferencePopup();
  loadWeaponData();
  loadWheelchairData();
  loadArmorData();
  loadLootData();
  loadConsumableData();
  loadAdversaryData();
  loadEnvironmentData();
});

// メニュー
function initMenu() {
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".site-menu");
  const submenuButtons = document.querySelectorAll(".submenu-toggle");

  if (!menuButton || !menu) return;

  /* メインメニュー開閉 */
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");

    menuButton.setAttribute("aria-expanded", isOpen);
    menu.setAttribute("aria-hidden", !isOpen);
  });

  /* サブメニュー開閉 */
  submenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const navItem = button.closest(".nav-item");

      if (!navItem) return;

      const submenu = button.nextElementSibling;

      if (!submenu || !submenu.classList.contains("submenu")) return;

      const isOpen = navItem.classList.toggle("is-open");

      button.setAttribute("aria-expanded", isOpen);
      submenu.hidden = !isOpen;
    });
  });

  /* メニュー内のリンクをクリックしたら閉じる */
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");

      menuButton.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");

      menu.querySelectorAll(".nav-item.is-open").forEach((item) => {
        item.classList.remove("is-open");
      });

      menu.querySelectorAll(".submenu-toggle").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });

      menu.querySelectorAll(".submenu").forEach((submenu) => {
        submenu.hidden = true;
      });
    });
  });
}

/* ==================== */
/* REFERENCE POPUP */
/* ==================== */

function initReferencePopup() {
  const references = document.querySelectorAll(
    'a.reference[href^="#"]'
  );

  if (!references.length) return;

  /* ポップアップ本体はHTMLに用意せず、JavaScriptで1つだけ生成する。 */
  const popup = document.createElement("div");
  popup.className = "reference-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-hidden", "true");

  document.body.appendChild(popup);

  let activeReference = null;
  let closeTimer = null;

  const isMobile = () => window.matchMedia(
    "(max-width: 700px)"
  ).matches;


  /* ==================== */
  /* 表示 */
  /* ==================== */

  const showPopup = (reference) => {
    const href = reference.getAttribute("href");

    if (!href || href === "#") return;

    const id = href.substring(1);
    const target = document.getElementById(id);

    if (!target) return;

    clearTimeout(closeTimer);

    /*
     * 対象要素の内容をコピー。
     * 元の要素そのものは移動しない。
     */
    popup.innerHTML = target.innerHTML;

    activeReference = reference;

    popup.classList.add("is-visible");
    popup.setAttribute("aria-hidden", "false");

    positionPopup(reference);
  };


  /* ==================== */
  /* 位置 */
  /* ==================== */

  const positionPopup = (reference) => {
    const rect = reference.getBoundingClientRect();

    /*
     * 一度表示状態にしてサイズを取得する。
     */
    const popupRect = popup.getBoundingClientRect();

    const margin = 8;

    let top = rect.bottom + margin;
    let left = rect.left;

    /*
     * 右端からはみ出す場合
     */
    if (left + popupRect.width > window.innerWidth - margin) {
      left = window.innerWidth - popupRect.width - margin;
    }

    /*
     * 左端からはみ出す場合
     */
    if (left < margin) {
      left = margin;
    }

    /*
     * 下にはみ出す場合はリンクの上に表示
     */
    if (top + popupRect.height > window.innerHeight - margin) {
      top = rect.top - popupRect.height - margin;
    }

    /*
     * 上にも入りきらない場合
     */
    if (top < margin) {
      top = margin;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  };


  /* ==================== */
  /* 非表示 */
  /* ==================== */

  const hidePopup = () => {
    popup.classList.remove("is-visible");
    popup.setAttribute("aria-hidden", "true");
    activeReference = null;
  };


  /* ==================== */
  /* PC：ホバー */
  /* ==================== */

  references.forEach((reference) => {

    reference.addEventListener("mouseenter", () => {
      if (isMobile()) return;

      showPopup(reference);
    });

    reference.addEventListener("mouseleave", () => {
      if (isMobile()) return;

      /*
       * すぐ消すのではなく少し待つ。
       * リンク → ポップアップへマウスを移動できるようにする。
       */
      closeTimer = setTimeout(() => {
        if (!popup.matches(":hover")) {
          hidePopup();
        }
      }, 100);
    });
  });

  /* ==================== */
  /* PC：ポップアップから離れる */
  /* ==================== */

  popup.addEventListener("mouseenter", () => {
    if (isMobile()) return;
    clearTimeout(closeTimer);
  });

  popup.addEventListener("mouseleave", () => {
    if (isMobile()) return;
    hidePopup();
  });

  /* スマホ：タップ */
  references.forEach((reference) => {
    reference.addEventListener("click", (event) => {

      if (!isMobile()) {
        /*
         * PCでは通常のリンク動作を止める。
         * ホバーでポップアップを表示するため。
         */
        event.preventDefault();
        return;
      }

      /* スマホではタップでポップアップ。 */
      event.preventDefault();

      if (activeReference === reference) {
        hidePopup();
      } else {
        showPopup(reference);
      }
    });
  });

  /* スマホ：外側をタップ */
  document.addEventListener("click", (event) => {
    if (!isMobile()) return;

    if (
      popup.classList.contains("is-visible") &&
      !popup.contains(event.target) &&
      !event.target.closest("a.reference")
    ) {
      hidePopup();
    }
  });

  /* スクロール・リサイズ */
  window.addEventListener("scroll", () => {
    if (activeReference) {
      positionPopup(activeReference);
    }
  });

  window.addEventListener("resize", () => {
    if (activeReference) {
      positionPopup(activeReference);
    }
  });
};

/* ==================== */
/* 表の作成 */
/* ==================== */

function loadWeaponData() {
  Promise.all([
    fetch("data/json/weapons_primary.json").then(response => response.json()),
    fetch("data/json/weapons_secondary.json").then(response => response.json())
  ])
    .then(([primaryWeaponData, secondaryWeaponData]) => {
      for (let tier = 1; tier <= 4; tier++) {
        createWeaponTable(
          `primary-tier-${tier}-physical-weapons`,
          primaryWeaponData[`tier${tier}-physical`]
        );
        createWeaponTable(
          `primary-tier-${tier}-physical-weapons-2`,
          primaryWeaponData[`tier${tier}-physical-2`]
        );
        createWeaponTable(
          `primary-tier-${tier}-magic-weapons`,
          primaryWeaponData[`tier${tier}-magic`]
        );
        createWeaponTable(
          `primary-tier-${tier}-magic-weapons-2`,
          primaryWeaponData[`tier${tier}-magic-2`]
        );
        createWeaponTable(
          `secondary-tier-${tier}-weapons`,
          secondaryWeaponData[`tier${tier}`]
        );
        createWeaponTable(
          `secondary-tier-${tier}-weapons-2`,
          secondaryWeaponData[`tier${tier}-2`]
        );
      };
    });
};

function createWeaponTable(tableId, weapons) {
  const table = document.querySelector(`#${tableId}`);

  if (!table || !weapons) return;

  table.innerHTML = `
    <thead>
      <tr>
        <th>名称</th>
        <th>特性</th>
        <th>射程</th>
        <th>ダメージ</th>
        <th>持ち手</th>
        <th>特徴</th>
      </tr>
    </thead>
    <tbody>
      ${weapons.map(weapon => `
        <tr>
          <th>
            ${weapon.name}<br>
            <span class="en-sub">${weapon.name_en}</span>
          </th>
          <td>【${weapon.trait}】</td>
          <td>${weapon.range}</td>
          <td>${weapon.damage}（${weapon.damageType}）</td>
          <td>${weapon.burden}</td>
          <td>
            ${
              weapon.feature
                ? `<b><em>${weapon.feature.name}<span class="en-sub">${weapon.feature.name_en}</span>：</em></b>${weapon.feature.description}`
                : "—"
            }
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
};

function loadWheelchairData() {
  fetch("data/json/wheelchair-frames.json")
    .then(response => response.json())
    .then(data => {
      createWheelchairTable(
        "light-frame-models-table",
        data["light"]
      );
      createWheelchairTable(
        "heavy-frame-models-table",
        data["heavy"]
      );
      createWheelchairTable(
        "arcane-frame-models-table",
        data["arcane"]
      );
    });
};

function createWheelchairTable(tableId, wheelchairs) {
  const table = document.querySelector(`#${tableId}`);

  if (!table || !wheelchairs) return;

  table.innerHTML = `
    <thead>
      <tr>
        <th>名称</th>
        <th>ティア</th>
        <th>特性</th>
        <th>射程</th>
        <th>ダメージ</th>
        <th>持ち手</th>
        <th>特徴</th>
      </tr>
    </thead>
    <tbody>
      ${wheelchairs.map(wheelchair => `
        <tr>
          <th>
            ${wheelchair.name}<br>
            <span class="en-sub">${wheelchair.name_en}</span>
          </th>
          <td>${wheelchair.tier}</td>
          <td>${wheelchair.trait}</td>
          <td>${wheelchair.range}</td>
          <td>${wheelchair.damage}（${wheelchair.damageType}）</td>
          <td>${wheelchair.burden}</td>
          <td>
            ${
              wheelchair.feature
                ? `<b><em>${wheelchair.feature.name}<span class="en-sub">${wheelchair.feature.name_en}</span>：</em></b>${wheelchair.feature.description}`
                : "—"
            }
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
};

function loadArmorData() {
  fetch("data/json/armors.json")
    .then(response => response.json())
    .then(armorData => {
      for (let tier = 1; tier <= 4; tier++) {
        createArmorTable(
          `tier-${tier}-armor`,
          armorData[`tier${tier}`]
        );
        createArmorTable(
          `tier-${tier}-armor-2`,
          armorData[`tier${tier}-2`]
        );
      };
    });
};

function createArmorTable(tableId, armors) {
  const table = document.querySelector(`#${tableId}`);

  if (!table || !armors) return;

  table.innerHTML = `
    <thead>
      <tr>
        <th>名称</th>
        <th>基本<br>閾値</th>
        <th>基本<br>防御値</th>
        <th>特徴</th>
      </tr>
    </thead>
    <tbody>
      ${armors.map(armor => `
        <tr>
          <th>
            ${armor.name}<br>
            <span class="en-sub">${armor.name_en}</span>
          </th>
          <td>${armor.thresholds}</td>
          <td>${armor.score}</td>
          <td>
            ${
              armor.feature
                ? `<b><em>${armor.feature.name}<span class="en-sub">${armor.feature.name_en}</span>：</em></b>${armor.feature.description}`
                : "—"
            }
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
};

function loadLootData() {
  fetch("data/json/loots.json")
    .then(response => response.json())
    .then(lootData => {
      const coreLeft = lootData.loots.filter(loot => loot.roll <= 30);
      const coreRight = lootData.loots.filter(loot => loot.roll >= 31);

      const additionalLeft = lootData["additional-loots"].filter(loot => loot.roll <= 30);
      const additionalRight = lootData["additional-loots"].filter(loot => loot.roll >= 31);

      createLootTable("loot-table-left", coreLeft);
      createLootTable("loot-table-right", coreRight);

      createLootTable("loot-table-2-left", additionalLeft);
      createLootTable("loot-table-2-right", additionalRight);
    });
}

function createLootTable(tableId, lootData) {
  const table = document.querySelector(`#${tableId}`);

  if (!table) return;

  table.innerHTML = `
    <thead>
      <tr>
        <th>出目</th>
        <th>戦利品</th>
        <th>説明</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  lootData.forEach(loot => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${loot.roll}</td>
      <th>${loot.name}<br><span class="en-sub">${loot.name_en}</span></th>
      <td>${loot.description}</td>
    `;

    tbody.appendChild(row);
  });
}

function loadConsumableData() {
  fetch("data/json/consumables.json")
    .then(response => response.json())
    .then(consumableData => {
      const coreLeft = consumableData.consumables.filter(consumable => consumable.roll <= 30);
      const coreRight = consumableData.consumables.filter(consumable => consumable.roll >= 31);

      const additionalLeft = consumableData["additional-consumables"].filter(consumable => consumable.roll <= 30);
      const additionalRight = consumableData["additional-consumables"].filter(consumable => consumable.roll >= 31);

      createConsumableTable("consumable-table-left", coreLeft);
      createConsumableTable("consumable-table-right", coreRight);

      createConsumableTable("consumable-table-2-left", additionalLeft);
      createConsumableTable("consumable-table-2-right", additionalRight);
    });
}

function createConsumableTable(tableId, consumableData) {
  const table = document.querySelector(`#${tableId}`);

  if (!table) return;

  table.innerHTML = `
    <thead>
      <tr>
        <th>結果</th>
        <th>消耗品</th>
        <th>説明</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  consumableData.forEach(consumable => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${consumable.roll}</td>
      <th>
        ${consumable.name}<br>
        <span class="en-sub">${consumable.name_en}</span>
      </th>
      <td>${consumable.description}</td>
    `;

    tbody.appendChild(row);
  });
}

function loadAdversaryData() {
  fetch("data/json/adversaries.json")
    .then(response => response.json())
    .then(adversaryData => {
      const select = document.querySelector("#adversary-select");

      if (!select) return;

      select.innerHTML = `
        <option value="" disabled>表示する敵を選択</option>
      `;

      for (let tier = 1; tier <= 4; tier++) {
        const tierAdversaries = adversaryData.filter(
          adversary => adversary.tier === tier
        );

        if (tierAdversaries.length === 0) continue;

        const tierLabel = document.createElement("option");

        tierLabel.value = "";
        tierLabel.disabled = true;
        tierLabel.textContent = `------ティア${tier}------`;

        select.appendChild(tierLabel);

        tierAdversaries.forEach(adversary => {
          const option = document.createElement("option");

          option.value = adversary.id;
          option.textContent = adversary.name;

          if (adversary.id === "acid-burrower") {
            option.selected = true;
          }

          select.appendChild(option);
        });
      }

      select.addEventListener("change", () => {
        const selectedAdversary = adversaryData.find(
          adversary => adversary.id === select.value
        );

        if (!selectedAdversary) return;

        createAdversaryStatBlock(selectedAdversary);
      });
    });
}

function createAdversaryStatBlock(adversary) {
  const display = document.querySelector(
    "#adversary-stat-block-display"
  );

  if (!display) return;

  display.innerHTML = `
    <h3>${adversary.name}<span class="en-sub">${adversary.name_en}</span></h3>
    <p><b><em>ティア${adversary.tier}・${adversary.type}</em></b></p>
    <p><em>${adversary.description}</em></p>
    <p><b>動機と戦術：</b>${adversary["motives-and-tactics"]}</p>
    <aside>
      <p><b>難易度：</b>${adversary.stats.difficulty}｜<b>閾値：</b>${adversary.stats.thresholds}｜<b>HP：</b>${adversary.stats.hp}｜<b>ストレス：</b>${adversary.stats.stress}<br><b>攻撃：</b>${adversary.standard_attack.modifier}｜<b>${adversary.standard_attack.name}<span class="en-sub">${adversary.standard_attack.name_en}</span>：</b>${adversary.standard_attack.range}｜${adversary.standard_attack.damage}（${adversary.standard_attack.damage_type}）</p>
      ${
        adversary.experiences
          ? `
            <hr>
            <p><b>経験：</b>${adversary.experiences}</p>
          `
          : ""
      }
    </aside>
    <h6>特徴</h6>
    ${adversary.features.map(feature => `
      <p class="feature"><b><em>${feature.name}<span class="en-sub">${feature.name_en}</span> — ${feature.type}：</em></b>${feature.description}</p>
    `).join("")}
  `;
}
function loadEnvironmentData() {
  fetch("data/json/environments.json")
    .then(response => response.json())
    .then(environmentData => {
      const select = document.querySelector("#environment-select");

      if (!select) return;

      select.innerHTML = `
        <option value="" disabled>表示する環境を選択</option>
      `;

      for (let tier = 1; tier <= 4; tier++) {
        const tierEnvironments = environmentData.filter(
          environment => environment.tier === tier
        );

        if (tierEnvironments.length === 0) continue;

        const tierLabel = document.createElement("option");

        tierLabel.value = "";
        tierLabel.disabled = true;
        tierLabel.textContent = `------ティア${tier}------`;

        select.appendChild(tierLabel);

        tierEnvironments.forEach(environment => {
          const option = document.createElement("option");

          option.value = environment.id;
          option.textContent = environment.name;

          if (environment.id === "abandoned-grove") {
            option.selected = true;
          }

          select.appendChild(option);
        });
      }

      select.addEventListener("change", () => {
        const selectedEnvironment = environmentData.find(
          environment => environment.id === select.value
        );

        if (!selectedEnvironment) return;

        createEnvironmentStatBlock(selectedEnvironment);
      });
    });
}

function createEnvironmentStatBlock(environment) {
  const display = document.querySelector(
    "#environment-stat-block-display"
  );

  if (!display) return;

  display.innerHTML = `
    <h3>${environment.name}<span class="en-sub">${environment.name_en}</span></h3>
    <p><b><em>ティア${environment.tier}・${environment.type}</em></b></p>
    <p><em>${environment.description}</em></p>
    <p><b>影響：</b>${environment.impulses}</p>
    <aside>
      <p>
        <b>難易度：</b>${environment.difficulty}<br>
        <b>出現する敵：</b>${environment.potential_adversaries}
      </p>
    </aside>
    <h6>特徴</h6>
    ${environment.features.map(feature => `
      <p class="feature">
        <b><em>${feature.name}<span class="en-sub">${feature.name_en}</span> — ${feature.type}：</em></b>
        ${feature.description}
      </p>
    `).join("")}
  `;
}