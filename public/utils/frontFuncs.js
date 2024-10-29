function addToCart(productId, quantity) {
  // AJAX request to add the product to the cart
  fetch('/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })
    .then((response) => response.json())
    .then((data) =>
      showToast(
        data.success
          ? 'Product added to cart successfully!'
          : 'Failed to add product to cart',
        data.success ? 'success' : 'error'
      )
    )
    .catch(() =>
      showToast(
        'An error occurred while adding the product to the cart',
        'error'
      )
    );
}

function addToWishlist(productId, quantity) {
  fetch('/wishlist/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Display a toast message for success or failure
      showToast(
        data.success
          ? 'Product added to wishlist successfully!'
          : 'Failed to add product to wishlist',
        data.success ? 'success' : 'error'
      );

      if (data.success) {
        const heartIcon = document.querySelector(
          `.bx-heart[data-id='${productId}']`
        );
        if (heartIcon) {
          heartIcon.classList.remove('bx-heart'); // Remove the empty heart icon
          heartIcon.classList.add('bxs-heart'); // Add the filled heart icon
          heartIcon.style.color = 'red'; // Optionally change color to indicate it's added
        }
      }
    })
    .catch(() =>
      showToast(
        'An error occurred while adding the product to the wishlist',
        'error'
      )
    );
}

function showToast(message, type) {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${message} <span class="close-btn">&times;</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);

  // Allow manual closing of the toast by clicking the close button
  toast.querySelector('.close-btn').addEventListener('click', () => {
    toast.remove();
  });
}

function toggleCart(productId, quantity = 1) {
  const cartIcon = document.querySelector(
    `.icons[data-id='${productId}'][data-type='cart']`
  );

  if (!cartIcon) {
    showToast('Cart icon not found', 'error');
    return;
  }

  const isInCart = cartIcon.classList.contains('bxs-cart');
  const action = isInCart ? 'remove' : 'add';

  fetch(`/cart/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Toggle cart icon based on action
        if (action === 'add') {
          cartIcon.classList.remove('bx-cart-add');
          cartIcon.classList.add('bxs-cart');
          cartIcon.style.color = '#9c52fe';
        } else {
          cartIcon.classList.remove('bxs-cart');
          cartIcon.classList.add('bx-cart-add');
          cartIcon.style.color = '#ffffff';
        }
        // Show success toast
        showToast(
          `Product ${action === 'add' ? 'added to' : 'removed from'} Cart!`,
          'success'
        );
      } else {
        // Show failure toast
        showToast(
          `Failed to ${action === 'add' ? 'add to' : 'remove from'} Cart`,
          'error'
        );
      }
    })
    .catch(() => {
      showToast('An error occurred while updating the cart', 'error');
    });
}

function toggleWishlist(productId) {
  const wishlistIcon = document.querySelector(
    `.icons[data-id='${productId}'][data-type='wishlist']`
  );

  if (!wishlistIcon) {
    showToast('Wishlist icon not found', 'error');
    return;
  }

  const isInWishlist = wishlistIcon.classList.contains('bxs-heart');
  const action = isInWishlist ? 'remove' : 'add';

  fetch(`/wishlist/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Toggle wishlist icon based on action
        if (action === 'add') {
          wishlistIcon.classList.remove('bx-heart');
          wishlistIcon.classList.add('bxs-heart');
          wishlistIcon.style.color = '#9c52fe';
        } else {
          wishlistIcon.classList.remove('bxs-heart');
          wishlistIcon.classList.add('bx-heart');
          wishlistIcon.style.color = '#ffffff';
        }
        // Show success toast
        showToast(
          `Product ${action === 'add' ? 'added to' : 'removed from'} Wishlist!`,
          'success'
        );
      } else {
        // Show failure toast
        showToast(
          `Failed to ${action === 'add' ? 'add to' : 'remove from'} Wishlist`,
          'error'
        );
      }
    })
    .catch(() => {
      showToast('An error occurred while updating the wishlist', 'error');
    });
}
