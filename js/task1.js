$(document).ready(function() {
  renderParty();
  setupCases();
});

function renderParty() {
  const $house = $("#house").empty();

  const $floor2 = $('<div class="floor" id="floor-2"><h2>Floor 2</h2><div class="rooms-wrapper"></div></div>');
  const $floor1 = $('<div class="floor" id="floor-1"><h2>Floor 1</h2><div class="rooms-wrapper"></div></div>');

  partyData.forEach(room => {
    const $roomDiv = $(`
      <div class="room" id="${room.id}">
        <div class="room-header">
          <h3>${room.name}</h3>
          <button class="btn-sort" data-room="${room.id}">Sort by time</button>
        </div>
        <div class="guests-container"></div>
      </div>
    `);

    const $container = $roomDiv.find('.guests-container');

    room.guests.forEach(guest => {
      const $card = createGuestCard(guest);
      $container.append($card);
    });

    if (room.floor === 2) {
      $floor2.find('.rooms-wrapper').append($roomDiv);
    } else {
      $floor1.find('.rooms-wrapper').append($roomDiv);
    }
  });

  $house.append($floor2, $floor1);
}

function createGuestCard(guest) {
  const avatarUrl = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${guest.name}`;
  const itemClasses = guest.items.map(i => `has-${i}`).join(" ");

  return $(`
    <div class="guest-card color-${guest.color} ${guest.aitu ? 'aitu-student' : ''} ${itemClasses}"
         data-name="${guest.name}"
         data-time="${guest.time}"
         data-color="${guest.color}"
         data-aitu="${guest.aitu}"
         data-items="${guest.items.join(', ')}">
      <div class="avatar-ring border-${guest.color}">
        <img src="${avatarUrl}" alt="${guest.name}" class="avatar-img">
        ${guest.aitu ? '<span class="aitu-badge">AITU</span>' : ''}
      </div>
      <div class="guest-name">${guest.name}</div>
      <div class="guest-time">${guest.time}</div>
      <div class="guest-items-icons">
        ${guest.items.map(item => `<span class="icon icon-${item}" title="${item}"></span>`).join('')}
      </div>
    </div>
  `);
}

function setupCases() {
  const caseChains = {
    1: () => $('#hall .guest-card'),
    2: () => $('.guest-card.color-yellow, .guest-card.color-purple'),
    3: () => $('#floor-2 .guest-card.aitu-student'),
    4: () => $('.guest-card.has-glasses, .guest-card.has-bag'),
    5: () => $('.guest-card:not(.has-phone):not(.has-glasses):not(.has-bag):not(.has-cup):not(.has-crumbs)'),
    6: () => $('.guest-card.has-phone:not(.has-bag)'),
    7: () => $('.guest-card').filter((i, el) => $(el).data('time') >= '20:30' && $(el).data('time') <= '21:00'),
    8: () => $('.guest-card:not(.aitu-student)').filter((i, el) => $(el).data('time') > '21:00'),
    9: () => $('.guest-card[data-name="Askar"]').prev().add($('.guest-card[data-name="Askar"]').next()),
    10: () => $('.room .guest-card:last-child'),
    11: () => $('.room .guest-card:nth-child(3)'),
    12: () => $('.guest-card[data-name="Timur"]').nextAll(),
    13: () => $('.guest-card.color-black').prev(),
    14: () => $('.guest-card[data-name="Aruzhan"]').closest('.room'),
    15: () => $('.room').filter((i, el) => $(el).find('.guest-card').length < 6),
    16: () => $('.room:has(.has-cup):not(:has(.has-glasses))'),
    17: () => $('.room').map((i, room) => $(room).find('.guest-card').get().sort((a,b) => $(a).data('time').localeCompare($(b).data('time')))[0]),
    18: () => {
      const miras = createGuestCard({ name: "Miras", color: "blue", time: "21:20", aitu: true, items: ["phone"] });
      miras.hide().insertAfter('.guest-card[data-name="Askar"]').fadeIn(600);
      return miras;
    },
    19: () => {
      const $natasha = $('.guest-card[data-name="Natasha"]');
      $natasha.fadeOut(600, function() { $(this).remove(); });
      return $natasha;
    },
    20: () => $('#floor-1 .guest-card.has-crumbs:not(.has-cup)').filter((i, el) => {
      const t = $(el).data('time');
      const hasAitu = $(el).prev().hasClass('aitu-student') || $(el).next().hasClass('aitu-student');
      return t > '21:00' && t < '21:30' && hasAitu;
    })
  };

  $('.btn-case').on('click', function() {
    const caseNum = $(this).data('case');
    
    renderParty();

    const $found = caseChains[caseNum]();

    applySpotlight($found);
    
    if ($found.hasClass('guest-card')) {
      $found.stop(true, true).animate({ marginTop: "-15px" }, 200).animate({ marginTop: "0px" }, 200);
    } else {
      $found.find('.guest-card').stop(true, true).animate({ marginTop: "-15px" }, 200).animate({ marginTop: "0px" }, 200);
    }

    const names = $found.hasClass('guest-card') 
      ? $found.map((i, el) => $(el).data('name')).get().join(', ')
      : $found.map((i, el) => $(el).find('h3').text()).get().join(', ');

    $('#result-info').html(`<strong>Found (${$found.length}):</strong> ${names || 'None'}`);
  });
}