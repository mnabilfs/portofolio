// dropdown nav
const navSlide = () => {
    const burger = document.querySelector(".burger");
    const navList = document.querySelector("nav");

    burger.addEventListener("click", () => {
        console.log("Burger clicked");
        navList.classList.toggle("nav-active");
        burger.classList.toggle("toggle-burger");
    });
};

document.addEventListener("DOMContentLoaded", () => {
    navSlide();
});

// reset contact
window.onbeforeunload = () => {
    const forms = document.getElementsByTagName("form");
    for (const form of forms) {
        form.reset();
    }
};

// nav smoots scroll 
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const targetId = link.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});

// animation text 
function typeWriterEffect() {
    const part1 = "Muhammad ";
    const part2 = "Nabil";
    const speed = 200;
    const part1Element = document.getElementById("part1");
    const part2Element = document.getElementById("part2");
    
    let i = 0;
    function typeWriter() {
      if (i < part1.length) {
        part1Element.innerHTML += part1.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      } else if (i < part1.length + part2.length) {
        part2Element.innerHTML += part2.charAt(i - part1.length);
        i++;
        setTimeout(typeWriter, speed);
      } else {
        i = 0;
        part1Element.innerHTML = "";
        part2Element.innerHTML = "";
        setTimeout(typeWriter, speed);
      }
    }
    
    typeWriter();
  }

  document.addEventListener("DOMContentLoaded", typeWriterEffect);


// animation service 
const serviceElements = document.querySelectorAll('.service');

const handleScrollAnimation = () => {
    serviceElements.forEach((service) => {
        const servicePosition = service.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (servicePosition < windowHeight * 0.75) {
            service.classList.add('animate-service');
        } else {
            service.classList.remove('animate-service');
        }
    });
};

window.addEventListener('scroll', handleScrollAnimation);

handleScrollAnimation();
