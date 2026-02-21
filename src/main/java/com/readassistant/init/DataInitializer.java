package com.readassistant.init;

import com.readassistant.model.Story;
import com.readassistant.repository.StoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StoryRepository storyRepository;

    public DataInitializer(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }

    @Override
    public void run(String... args) {
        // English stories

        // Level 1 — sight words, 2-3 word sentences
        storyRepository.save(new Story(
                "My Cat",
                "I have a cat. My cat is big. My cat is soft. I love my cat. My cat loves me. We play all day.",
                1, "en"
        ));

        storyRepository.save(new Story(
                "The Sun",
                "The sun is up. It is hot. I can see the sun. The sun is big. I like the sun. It makes me warm.",
                1, "en"
        ));

        // Level 2 — longer sentences, simple blends
        storyRepository.save(new Story(
                "A Day at the Park",
                "I went to the park with my mom. We saw a big slide. I went down the slide fast. Then I played on the swings. My mom pushed me high. We had so much fun at the park.",
                2, "en"
        ));

        storyRepository.save(new Story(
                "My Pet Fish",
                "I have a pet fish. His name is Bubbles. He lives in a tank. I feed him every day. He swims round and round. Bubbles is my best friend.",
                2, "en"
        ));

        // Level 3 — compound sentences, more vocabulary
        storyRepository.save(new Story(
                "The Little Bird",
                "A little bird sat on a tree. It sang a pretty song. The bird was blue and yellow. It flew down to get some food. Then it flew back up to its nest. The little bird was happy in its home.",
                3, "en"
        ));

        storyRepository.save(new Story(
                "Rainy Day Fun",
                "It was raining outside so we stayed inside. My sister and I made a big fort with blankets. We read books and told funny stories. Mom made us hot chocolate with marshmallows. Rainy days can be so much fun when you use your imagination.",
                3, "en"
        ));

        // Bulgarian stories

        // Level 1 — sight words, short sentences
        storyRepository.save(new Story(
                "Моята котка",
                "Аз имам котка. Тя е голяма. Тя е мека. Обичам я. Тя ме обича. Играем цял ден.",
                1, "bg"
        ));

        storyRepository.save(new Story(
                "Слънцето",
                "Слънцето грее. То е топло. Виждам слънцето. То е голямо. Харесвам слънцето. То ме топли.",
                1, "bg"
        ));

        // Level 2 — longer sentences, simple structure
        storyRepository.save(new Story(
                "Ден в парка",
                "Отидох в парка с мама. Видяхме голяма пързалка. Пързалях се бързо надолу. После играх на люлките. Мама ме люлееше високо. Много се забавлявахме в парка.",
                2, "bg"
        ));

        storyRepository.save(new Story(
                "Моята рибка",
                "Имам рибка. Казва се Балончо. Живее в аквариум. Храня я всеки ден. Тя плува насам натам. Балончо е моят най-добър приятел.",
                2, "bg"
        ));

        // Level 3 — compound sentences, more vocabulary
        storyRepository.save(new Story(
                "Малката птичка",
                "Една малка птичка кацна на дърво. Тя пееше красива песен. Птичката беше синя и жълта. Тя долетя да вземе храна. После се върна в гнездото си. Малката птичка беше щастлива в дома си.",
                3, "bg"
        ));

        storyRepository.save(new Story(
                "Дъждовен ден",
                "Навън валеше дъжд и останахме вкъщи. Със сестра ми направихме голяма крепост от одеяла. Четохме книги и разказвахме смешни истории. Мама ни направи горещ шоколад с маршмелоу. Дъждовните дни са забавни когато използваш въображението си.",
                3, "bg"
        ));
    }
}
