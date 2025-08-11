document.getElementById("ageForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const dobInput = document.getElementById("dob").value;
    const resultDiv = document.getElementById("result");
    const iconSpan = resultDiv.querySelector('.icon');
    const resultText = resultDiv.querySelector('.result-text');
  
    resultDiv.classList.remove('show');
    iconSpan.style.display = 'none';
    resultText.textContent = '';
  
    if (!dobInput) {
      resultText.textContent = "Please enter your date of birth.";
      setTimeout(() => resultDiv.classList.add('show'), 10);
      return;
    }
  
    const dob = new Date(dobInput);
    const today = new Date();
  
    if (dob > today) {
      resultText.textContent = "Date of birth cannot be in the future.";
      setTimeout(() => resultDiv.classList.add('show'), 10);
      return;
    }
  
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
  
    // Adjust if days are negative
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
  
    // Adjust if months are negative
    if (months < 0) {
      years--;
      months += 12;
    }
  
    // Show icon and animate result
    iconSpan.textContent = "🎉";
    iconSpan.style.display = 'inline-block';
    resultText.textContent = `You are ${years} years, ${months} months, and ${days} days old.`;
    setTimeout(() => resultDiv.classList.add('show'), 10);
  
    // Confetti effect (emoji burst)
    confettiBurst(resultDiv);
  });
  
  function confettiBurst(parent) {
    // Remove old confetti
    const old = parent.querySelectorAll('.confetti');
    old.forEach(e => e.remove());
  
    const emojis = ['🎊','✨','🎉','🥳','💫','🌟'];
    for (let i = 0; i < 18; i++) {
      const conf = document.createElement('span');
      conf.className = 'confetti';
      conf.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      conf.style.position = 'absolute';
      conf.style.left = (40 + Math.random()*60) + '%';
      conf.style.top = (60 + Math.random()*10) + '%';
      conf.style.fontSize = (1.1 + Math.random()*1.2) + 'rem';
      conf.style.opacity = 0.7 + Math.random()*0.3;
      conf.style.pointerEvents = 'none';
      conf.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`;
      conf.style.transition = 'all 1.2s cubic-bezier(.68,-0.55,.27,1.55)';
      parent.appendChild(conf);
      setTimeout(() => {
        conf.style.top = (10 + Math.random()*20) + '%';
        conf.style.opacity = 0;
      }, 30);
      setTimeout(() => conf.remove(), 1400);
    }
  }
  