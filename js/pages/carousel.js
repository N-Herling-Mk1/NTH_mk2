let audioPlaying = false;
let animationPlaying = false;
let clickBlocked = false;  // Master click blocker ...
let _MASTER_BLOCK_TIME = 1900;

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".carousel");
    const originalTiles = Array.from(document.querySelectorAll(".page-link"));
    const leftBtn = document.querySelector(".carousel-toggle.left");
    const rightBtn = document.querySelector(".carousel-toggle.right");

    // ✳️ Added: preload audio element reference
    const clickSound = document.getElementById("clickSound");
    // ✳️ End added

    if (clickSound) {
        clickSound.addEventListener("ended", () => {
            audioPlaying = false;
        });
    }

    const total = originalTiles.length;
    if (total < 3) {
        console.warn("Carousel requires at least 3 tiles");
        return;
    }

    const tileStyle = getComputedStyle(originalTiles[0]);
    const tileWidth = originalTiles[0].offsetWidth +
        parseInt(tileStyle.marginLeft) +
        parseInt(tileStyle.marginRight);

    let centerIndex = 0;
    const windowSize = 3;
    const windowTiles = [];

    carousel.innerHTML = "";
    for (let i = 0; i < windowSize; i++) {
        const tile = document.createElement("div");
        tile.classList.add("page-link");
        tile.style.width = tileStyle.width;
        tile.style.marginLeft = tileStyle.marginLeft;
        tile.style.marginRight = tileStyle.marginRight;
        carousel.appendChild(tile);
        windowTiles.push(tile);
    }

    function updateWindowTiles() {
        for (let i = 0; i < windowSize; i++) {
            const idx = (centerIndex - 2 + i + total) % total;
            const tile = windowTiles[i];
            const original = originalTiles[idx];

            tile.dataset.large = original.dataset.large;
            tile.dataset.small = original.dataset.small;

            tile.innerHTML = `
  ${original.dataset.img ? `<img src="${original.dataset.img}" alt="${original.dataset.large || ''}" class="tile-image">` : ''}
  <div class="large-label">${original.dataset.large || ""}</div>
  <div class="small-label">${original.dataset.small || ""}</div>
`;


            tile.onclick = () => {
                console.log(`Clicked tile: large="${tile.dataset.large}", small="${tile.dataset.small}"`);
            };

            tile.onmouseenter = () => {
                console.log(`Hover start on tile: index=${idx}`);
            };

            tile.onmouseleave = () => {
                console.log(`Hover end on tile: index=${idx}`);
            };

            tile.classList.remove("center", "fade-out", "pulse-animation");
        }
    }

    function setCarouselPosition(positionX, animate = true) {
        carousel.style.transition = animate ? "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none";
        carousel.style.transform = `translate3d(${positionX}px, 0, 0)`;
    }

    setCarouselPosition(0, false);
    updateWindowTiles();
    updateWindowTiles();
    windowTiles[1].classList.add("center"); // center tile pulses on load

    let isAnimating = false;

    function scroll(direction) {
        if (isAnimating) return;
        isAnimating = true;
        animationPlaying = true;

        leftBtn.disabled = true;
        rightBtn.disabled = true;

        windowTiles.forEach(tile => tile.classList.add("fade-out"));

        setTimeout(() => {
            centerIndex = (centerIndex + (direction === "right" ? 1 : -1) + total) % total;
            updateWindowTiles();
            setCarouselPosition(direction === "right" ? tileWidth : -tileWidth, false);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setCarouselPosition(0, true);
                });
            });

            carousel.addEventListener("transitionend", function handler(e) {
                if (e.propertyName !== "transform") return;
                carousel.removeEventListener("transitionend", handler);
                setCarouselPosition(0, false);

                setTimeout(() => {
                    const centerTile = windowTiles[1];
                    centerTile.classList.remove("fade-out");
                    centerTile.classList.add("center");

                    centerTile.classList.remove("pulse-animation");
                    void centerTile.offsetWidth;
                    centerTile.classList.add("pulse-animation");
                    animationPlaying = false;


                }, 75);

                isAnimating = false;
                leftBtn.disabled = false;
                rightBtn.disabled = false;
            });
        }, 850);
    }


    //... electric fuzz ..
    function addElectricEffect(button) {
        button.classList.add('electric-haze');
        setTimeout(() => {
            button.classList.remove('electric-haze');
        }, 1500);
    }

    leftBtn.addEventListener("click", () => {
        if (audioPlaying || animationPlaying || clickBlocked) return;  // Block clicks if needed
        clickBlocked = true; // block immediately

        setTimeout(() => {
            clickBlocked = false; // unblock after 1.5s (or whatever you want)
        }, _MASTER_BLOCK_TIME);

        addElectricEffect(leftBtn);
        scroll("left");

        if (clickSound) {
            clickSound.pause();
            clickSound.currentTime = 0;
            clickSound.play();
        }

    });


    rightBtn.addEventListener("click", () => {
        if (audioPlaying || animationPlaying || clickBlocked) return;  // Block clicks if needed
        clickBlocked = true; // block immediately

        setTimeout(() => {
            clickBlocked = false; // unblock after 1.5s (or whatever you want)
        }, _MASTER_BLOCK_TIME);

        //createSparks(rightBtn);
        addElectricEffect(rightBtn);
        scroll("right");

        // ✳️ Added: play click sound on right button
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
        // ✳️ End added

    });
});

