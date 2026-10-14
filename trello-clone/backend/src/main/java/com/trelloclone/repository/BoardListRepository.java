package com.trelloclone.repository;

import com.trelloclone.entity.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardListRepository extends JpaRepository<BoardList, Long> {
}
