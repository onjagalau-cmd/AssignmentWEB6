$(document).ready(function() {
  setupSpotlight();
  setupGuestModal();
  setupRoomSort();
});

function applySpotlight($target) {
  const $allGuests = $('.guest-card');
  $allGuests.stop(true, true).fadeTo(300, 1.0);

  if (!$target || $target.length === 0) return;

  if ($target.hasClass('guest-card')) {
    $allGuests.not($target).stop(true, true).fadeTo(300, 0.2);
  } else if ($target.hasClass('room')) {
    $allGuests.not($target.find('.guest-card')).stop(true, true).fadeTo(300, 0.2);
  }
}

function setupSpotlight() {
  $('#btn-clear').on('click', function() {
    $('.guest-card').stop(true, true).fadeTo(300, 1.0);
    $('#result-info').empty();
  });
}

function setupGuestModal() {
  $(document).on('click', '.guest-card', function(e) {
    if ($(e.target).hasClass('btn-move')) return;

    $('.guest-modal').remove();

    const $card = $(this);
    const offset = $card.offset();
    const name = $card.data('name');
    const time = $card.data('time');
    const color = $card.data('color');
    const aitu = $card.data('aitu');
    const items = $card.data('items') || "Nothing";

    const $modal = $(`
      <div class="guest-modal">
        <div class="modal-content">
          <span class="btn-close">&times;</span>
          <h3>${name}</h3>
          <p><strong>Arrival:</strong> Came at ${time}</p>
          <p><strong>Status:</strong> ${aitu ? 'AITU Student' : 'Guest'}</p>
          <p><strong>Color:</strong> ${color}</p>
          <p><strong>Items:</strong> Has ${items}</p>
          <hr>
          <div class="move-buttons">
            <button class="btn-move" data-target="balcony">Move to Balcony</button>
            <button class="btn-move" data-target="hall">Move to Hall</button>
            <button class="btn-move" data-target="kitchen">Move to Kitchen</button>
            <button class="btn-move" data-target="living-room">Move to Living Room</button>
          </div>
        </div>
      </div>
    `);

    $modal.css({
      top: offset.top,
      left: offset.left,
      width: $card.outerWidth(),
      height: $card.outerHeight(),
      opacity: 0
    });

    $('body').append($modal);

    $modal.stop(true, true).animate({
      top: $(window).scrollTop() + 100,
      left: ($(window).width() - 320) / 2,
      width: 320,
      height: 380,
      opacity: 1
    }, 300);

    $modal.data('origin', offset);
    $modal.data('sourceCard', $card);
  });

  $(document).on('click', '.btn-close', closeModal);
  $(document).on('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  function closeModal() {
    const $modal = $('.guest-modal');
    if ($modal.length === 0) return;

    const origin = $modal.data('origin');
    $modal.stop(true, true).animate({
      top: origin.top,
      left: origin.left,
      width: 50,
      height: 50,
      opacity: 0
    }, 250, function() {
      $modal.remove();
    });
  }

  $(document).on('click', '.btn-move', function() {
    const targetRoomId = $(this).data('target');
    const $modal = $('.guest-modal');
    const $card = $modal.data('sourceCard');
    const $targetContainer = $(`#${targetRoomId} .guests-container`);

    if ($card.parent().parent().attr('id') === targetRoomId) return;

    closeModal();

    const startPos = $card.offset();
    const $clone = $card.clone().addClass('flying-card').css({
      position: 'absolute',
      top: startPos.top,
      left: startPos.left,
      zIndex: 1000
    }).appendTo('body');

    $card.css('visibility', 'hidden');

    const $placeholder = $('<div class="guest-card placeholder"></div>').appendTo($targetContainer);
    const endPos = $placeholder.offset();
    $placeholder.remove();

    $clone.stop(true, true).animate({
      top: endPos.top,
      left: endPos.left
    }, 600, function() {
      $card.appendTo($targetContainer).css('visibility', 'visible');
      $clone.remove();
    });
  });
}

function setupRoomSort() {
  $(document).on('click', '.btn-sort', function() {
    const roomId = $(this).data('room');
    const $container = $(`#${roomId} .guests-container`);
    const $cards = $container.find('.guest-card').get();

    const isSorted = $container.data('sorted') || false;

    if (!isSorted) {
      $cards.sort((a, b) => $(a).data('time').localeCompare($(b).data('time')));
      $container.data('sorted', true);
    } else {
      const originalRoom = partyData.find(r => r.id === roomId);
      const originalNames = originalRoom.guests.map(g => g.name);
      $cards.sort((a, b) => originalNames.indexOf($(a).data('name')) - originalNames.indexOf($(b).data('name')));
      $container.data('sorted', false);
    }

    $.each($cards, function(idx, card) {
      $(card).hide().appendTo($container).stop(true, true).fadeIn(300 + idx * 50);
    });
  });
}