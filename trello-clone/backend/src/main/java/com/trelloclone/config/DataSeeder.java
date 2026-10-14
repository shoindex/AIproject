package com.trelloclone.config;

import com.trelloclone.entity.Board;
import com.trelloclone.entity.BoardList;
import com.trelloclone.repository.BoardListRepository;
import com.trelloclone.repository.BoardRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    private final BoardRepository boardRepository;
    private final BoardListRepository boardListRepository;

    public DataSeeder(BoardRepository boardRepository, BoardListRepository boardListRepository) {
        this.boardRepository = boardRepository;
        this.boardListRepository = boardListRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (boardRepository.count() > 0) {
            return;
        }

        Board board = new Board();
        board.setTitle("マイボード");
        boardRepository.save(board);

        String[] listTitles = {"未着手", "進行中", "完了"};
        for (int i = 0; i < listTitles.length; i++) {
            BoardList list = new BoardList();
            list.setTitle(listTitles[i]);
            list.setPosition(i);
            list.setBoard(board);
            boardListRepository.save(list);
        }
    }
}
