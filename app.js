for (const form of document.querySelectorAll('.request-form')) {
  const preview = event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const output = form.querySelector('.form-result');
    output.textContent = 'Это демонстрация формы. Данные не отправлены и не сохранены; заказ не оформлен. В рабочей версии здесь появится подтверждение обращения.';
    output.classList.add('success');
  };
  form.addEventListener('submit', preview);
  form.querySelector('button').addEventListener('click', preview);
}
