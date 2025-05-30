export const validateTest = (test, settings) => {
  const errors = [];
  if (!test.title || test.title.trim() === "") {
    errors.push("Укажите название теста.");
  }

  if (!test.questions || test.questions.length === 0) {
    errors.push("Добавьте хотя бы один вопрос.");
  }

  const belbinQuestions = test.questions.filter((q) => q.isBelbin);

  //   if (belbinQuestions.length > 0 && belbinQuestions.length % settings. !== 0) {
  //     errors.push(
  //       `Количество Белбин-вопросов должно быть кратно 7. Сейчас: ${belbinQuestions.length}`
  //     );
  //   }
  if (
    belbinQuestions.length > 0 &&
    belbinQuestions.length != settings.belbin_block
  ) {
    errors.push(
      `Количество Белбин-вопросов должно быть  ${settings.belbin_block}. Сейчас: ${belbinQuestions.length}`
    );
  }
  if (!test.deadline) {
    errors.push(`Не указана дата окончания теста`);
  }
  if (belbinQuestions.length > 0) {
    const blocks = Math.floor(belbinQuestions.length / 7);
    for (let b = 0; b < blocks; b++) {
      const block = belbinQuestions.slice(b * 7, (b + 1) * 7);
      if (block.length !== 7) {
        errors.push(
          `Вопрос №${b + 1} содержит ${
            block.length
          } Белбин-вопросов (ожидалось ${settings.belbin_questions_in_block}).`
        );
      }
    }
  }
  if (settings.has_time_limit) {
    if (!test.time_limit_minutes)
      errors.push("Не заданное время выполнения теста.");
    else if (test.time_limit_minutes <= 0)
      errors.push("Время выполнения теста должно быть больше нуля.");
  }
  test.questions.forEach((q, index) => {
    console.log(q.answers.length);
    console.log(q);
    const isBelbin = !!q.isBelbin;

    if (!q.text || q.text.trim() === "") {
      errors.push(`Вопрос №${index + 1} не имеет названия.`);
    }

    if (!q.answers || q.answers.length === 0) {
      errors.push(`У вопроса №${index + 1} нет вариантов ответа.`);
    }

    if (
      !isBelbin &&
      q.answers.length < settings.min_questions &&
      q.question_type !== "text_answer"
    ) {
      console.log(settings.min_questions);

      errors.push(
        `У вопроса №${index + 1} должно быть от ${
          settings.min_questions
        } вариантов ответа.`
      );
    }
    if (isBelbin && q.answers.length != settings.belbin_questions_in_block) {
      errors.push(
        `У Белбин-вопроса №${index + 1} должно быть  ${
          settings.belbin_questions_in_block
        } вариантов ответа.`
      );
    }
    if (isBelbin) {
      for (let i = 0; i < q.answers.length; i++) {
        if (
          !q.answers[i]?.role?.name ||
          q.answers[i]?.role?.name?.trim() === ""
        ) {
          errors.push(
            `У Белбин-вопроса №${index + 1}, вариант №${i + 1} не указана роль.`
          );
        }
      }
    } else {
      let isCorrect = false;
      for (let i = 0; i < q.answers.length; i++) {
        if (!q.answers[i].text || q.answers[i].text.trim() === "") {
          errors.push(`Вариант ответа вопроса №${index + 1} не имеет текста.`);
        }
        if (q.answers[i].is_correct) {
          isCorrect = true;
        }
      }
      if (!isCorrect) {
        errors.push(`Вопрос №${index + 1} не имеет правильного ответа.`);
      }
    }
  });

  return errors;
};
